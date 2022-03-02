from tortoise import Model, fields
from enum import IntEnum

# Enumerators
class StakeType(IntEnum):
    STAKE       = 0
    UNSTAKE     = 1
    FARM_CLAIM  = 2
    COMPOUND    = 3

# Unique contract instances
class MVKToken(Model):
    address                         = fields.CharField(pk=True, max_length=36)
    maximum_supply                  = fields.BigIntField(default=0)
    total_supply                    = fields.BigIntField(default=0)

    class Meta:
        table = 'mvk_token'

class Doorman(Model):
    address                         = fields.CharField(pk=True, max_length=36)
    smvk_total_supply               = fields.BigIntField(default=0)
    min_mvk_amount                  = fields.BigIntField(default=0)
    unclaimed_rewards               = fields.BigIntField(default=0)
    accumulated_fees_per_share      = fields.FloatField(default=0)
    stake_paused                    = fields.BooleanField(default=False)
    unstake_paused                  = fields.BooleanField(default=False)
    compound_paused                 = fields.BooleanField(default=False)

    class Meta:
        table = 'doorman'

class Farm(Model):
    address                         = fields.CharField(pk=True, max_length=36)
    lp_token                        = fields.CharField(max_length=36)
    open                            = fields.BooleanField(default=False)
    init_block                      = fields.BigIntField(default=0)
    last_block_update               = fields.BigIntField(default=0)
    unpaid_rewards                  = fields.BigIntField(default=0)
    paid_rewards                    = fields.BigIntField(default=0)
    accumulated_mvk_per_share       = fields.FloatField(default=0)
    total_blocks                    = fields.BigIntField(default=0)
    blocks_per_minute               = fields.BigIntField(default=0)
    infinite                        = fields.BooleanField(default=False)
    deposit_paused                  = fields.BooleanField(default=False)
    withdraw_paused                 = fields.BooleanField(default=False)
    claim_paused                    = fields.BooleanField(default=False)
    farm_factory                    = fields.ForeignKeyField('models.Farm', related_name='farms')

    class Meta:
        table = 'farm'

class FarmFactory(Model):
    address                         = fields.CharField(pk=True, max_length=36)
    blocks_per_minute               = fields.BigIntField(default=0)
    create_farm_paused              = fields.BooleanField(default=False)
    track_farm_paused               = fields.BooleanField(default=False)
    untrack_farm_paused             = fields.BooleanField(default=False)

    class Meta:
        table = 'farm_factory'

# Users
class User(Model):
    address                         = fields.CharField(pk=True, max_length=36)
    mvk_balance                     = fields.BigIntField(default=0)
    smvk_balance                    = fields.BigIntField(default=0)
    participation_fees_per_share    = fields.FloatField(default=0)
    operators                       = fields.ManyToManyField('models.User', related_name='operates', null=True)
    doorman                         = fields.ForeignKeyField('models.Doorman', related_name='stake_accounts', null=True)

    class Meta:
        table = 'user'

class FarmAccount(Model):
    id                              = fields.BigIntField(pk=True, default=0)
    deposited_amount                = fields.BigIntField(default=0)
    participation_mvk_per_share     = fields.FloatField(default=0)
    user                            = fields.ForeignKeyField('models.User', related_name='farm_accounts')
    farm                            = fields.ForeignKeyField('models.Farm', related_name='farm')

    class Meta:
        table = 'user'

# Time-based records
class TransferRecord(Model):
    id                              = fields.BigIntField(pk=True)
    timestamp                       = fields.DatetimeField()
    token_address                   = fields.ForeignKeyField('models.MVKToken', related_name='transfer_records')
    from_                           = fields.ForeignKeyField('models.User', related_name='transfer_sender')
    to_                             = fields.ForeignKeyField('models.User', related_name='transfer_receiver')
    amount                          = fields.BigIntField(default=0)

    class Meta:
        table = 'transfer_record'

class StakeRecord(Model):
    id                              = fields.BigIntField(pk=True)
    timestamp                       = fields.DatetimeField()
    type                            = fields.IntEnumField(enum_type=StakeType)
    mvk_loyalty_index               = fields.FloatField(default=0.0)
    exit_fee                        = fields.BigIntField(default=0)
    from_                           = fields.ForeignKeyField('models.User', related_name='stake_records')
    desired_amount                  = fields.BigIntField(default=0)
    final_amount                    = fields.BigIntField(default=0)
    doorman                         = fields.ForeignKeyField('models.Doorman', related_name='stake_records')

    class Meta:
        table = 'stake_record'