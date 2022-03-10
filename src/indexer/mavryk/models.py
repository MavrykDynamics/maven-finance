from tortoise import Model, fields
from enum import IntEnum


class ExampleModel(Model):
    id = fields.IntField(pk=True)
    ...

    class Meta:
        table = 'example_models'

class StakeType(IntEnum):
    STAKE       = 0
    UNSTAKE     = 1
    FARM_CLAIM  = 2
    COMPOUND    = 3

class MVKToken(Model):
    address                         = fields.CharField(pk=True, max_length=36)
    maximum_supply                  = fields.BigIntField(default=0)
    total_supply                    = fields.BigIntField(default=0)

    class Meta:
        table = 'mvk_token'

class Doorman(Model):
    address                         = fields.CharField(pk=True, max_length=36)
    smvk_total_supply               = fields.FloatField(default=0)
    min_mvk_amount                  = fields.BigIntField(default=0)
    unclaimed_rewards               = fields.FloatField(default=0)
    accumulated_fees_per_share      = fields.FloatField(default=0)
    stake_paused                    = fields.BooleanField(default=False)
    unstake_paused                  = fields.BooleanField(default=False)
    compound_paused                 = fields.BooleanField(default=False)

    class Meta:
        table = 'doorman'

class Farm(Model):
    address                         = fields.CharField(pk=True, max_length=36)
    lp_token                        = fields.CharField(max_length=36, default='')
    lp_balance                      = fields.BigIntField(default=0)
    open                            = fields.BooleanField(default=False)
    rewards_from_treasury           = fields.BooleanField(default=False)
    init_block                      = fields.BigIntField(default=0)
    last_block_update               = fields.BigIntField(default=0)
    accumulated_mvk_per_share       = fields.FloatField(default=0)
    total_blocks                    = fields.BigIntField(default=0)
    reward_per_block                = fields.FloatField(default=0)
    blocks_per_minute               = fields.BigIntField(default=0)
    infinite                        = fields.BooleanField(default=False)
    deposit_paused                  = fields.BooleanField(default=False)
    withdraw_paused                 = fields.BooleanField(default=False)
    claim_paused                    = fields.BooleanField(default=False)
    farm_factory                    = fields.ForeignKeyField('models.FarmFactory', related_name='farms', null=True)

    class Meta:
        table = 'farm'

class FarmFactory(Model):
    address                         = fields.CharField(pk=True, max_length=36)
    create_farm_paused              = fields.BooleanField(default=False)
    track_farm_paused               = fields.BooleanField(default=False)
    untrack_farm_paused             = fields.BooleanField(default=False)

    class Meta:
        table = 'farm_factory'

class Delegation(Model):
    address                         = fields.CharField(pk=True, max_length=36)
    minimum_smvk_balance            = fields.BigIntField(default=0)
    delegation_ratio                = fields.BigIntField(default=0)
    max_satellites                  = fields.BigIntField(default=0)
    delegate_to_satellite_paused    = fields.BooleanField(default=False)
    undelegate_from_satellite_paused= fields.BooleanField(default=False)
    register_as_satellite_paused    = fields.BooleanField(default=False)
    unregister_as_satellite_paused  = fields.BooleanField(default=False)
    update_satellite_record_paused  = fields.BooleanField(default=False)

    class Meta:
        table = 'delegation'

class MavrykUser(Model):
    address                         = fields.CharField(pk=True, max_length=36)
    mvk_balance                     = fields.BigIntField(default=0)
    smvk_balance                    = fields.BigIntField(default=0)
    participation_fees_per_share    = fields.FloatField(default=0)
    doorman                         = fields.ForeignKeyField('models.Doorman', related_name='stake_accounts', null=True)

    class Meta:
        table = 'mavryk_user'

class FarmAccount(Model):
    id                              = fields.BigIntField(pk=True, default=0)
    deposited_amount                = fields.BigIntField(default=0)
    participation_mvk_per_share     = fields.FloatField(default=0)
    user                            = fields.ForeignKeyField('models.MavrykUser', related_name='farm_accounts', index=True)
    farm                            = fields.ForeignKeyField('models.Farm', related_name='farm_accounts', index=True)

    class Meta:
        table = 'farm_account'

class SatelliteRecord(Model):
    id                              = fields.BigIntField(pk=True, default=0)
    user                            = fields.ForeignKeyField('models.MavrykUser', related_name='satellite_record')
    delegation                      = fields.ForeignKeyField('models.Delegation', related_name='satellite_records')
    registered_datetime             = fields.DatetimeField()
    unregistered_datetime           = fields.DatetimeField()
    active                          = fields.BooleanField(default=False)
    fee                             = fields.BigIntField(default=0)
    name                            = fields.CharField(max_length=255) #TODO: Set max length in contract + here
    description                     = fields.CharField(max_length=255) #TODO: Set max length in contract + here
    image                           = fields.CharField(max_length=255) #TODO: Set max length in contract + here

    class Meta:
        table = 'satellite_record'

class DelegationRecord(Model):
    id                              = fields.BigIntField(pk=True)
    satellite_record                = fields.ForeignKeyField('models.SatelliteRecord', related_name='delegation_records')
    user                            = fields.ForeignKeyField('models.MavrykUser', related_name='delegation_records')
    delegation                      = fields.ForeignKeyField('models.Delegation', related_name='delegation_records')

    class Meta:
        table = 'delegation_record'

class TransferRecord(Model):
    id                              = fields.BigIntField(pk=True)
    timestamp                       = fields.DatetimeField()
    token_address                   = fields.ForeignKeyField('models.MVKToken', related_name='transfer_records')
    from_                           = fields.ForeignKeyField('models.MavrykUser', related_name='transfer_sender')
    to_                             = fields.ForeignKeyField('models.MavrykUser', related_name='transfer_receiver')
    amount                          = fields.BigIntField(default=0)

    class Meta:
        table = 'transfer_record'

class StakeRecord(Model):
    id                              = fields.BigIntField(pk=True)
    timestamp                       = fields.DatetimeField()
    type                            = fields.IntEnumField(enum_type=StakeType)
    mvk_loyalty_index               = fields.FloatField(default=0.0)
    exit_fee                        = fields.BigIntField(default=0)
    from_                           = fields.ForeignKeyField('models.MavrykUser', related_name='stake_records')
    desired_amount                  = fields.BigIntField(default=0)
    final_amount                    = fields.BigIntField(default=0)
    doorman                         = fields.ForeignKeyField('models.Doorman', related_name='stake_records')

    class Meta:
        table = 'stake_record'