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

class ActionStatus(IntEnum):
    PENDING     = 0
    FLUSHED     = 1
    EXECUTED    = 2

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

class Council(Model):
    address                         = fields.CharField(pk=True, max_length=36)
    threshold                       = fields.BigIntField(default=0)
    action_expiry_days              = fields.BigIntField(default=0)
    threshold_signers               = fields.BigIntField(default=0)

    class Meta:
        table = 'council'

class Vesting(Model):
    address                         = fields.CharField(pk=True, max_length=36)
    default_cliff_period            = fields.BigIntField(default=0)
    default_cooldown_period         = fields.BigIntField(default=0)
    total_vested_amount             = fields.BigIntField(default=0)

    class Meta:
        table = 'vesting'

class EmergencyGovernance(Model):
    address                         = fields.CharField(pk=True, max_length=36)
    current_emergency_record_id     = fields.BigIntField(default=0)
    next_emergency_record_id        = fields.BigIntField(default=0)
    required_fee                    = fields.BigIntField(default=0)
    smvk_percentage_required        = fields.BigIntField(default=0)
    vote_expiry_days                = fields.BigIntField(default=0)

    class Meta:
        table = 'emergency_governance'

class MavrykUser(Model):
    address                         = fields.CharField(pk=True, max_length=36)
    mvk_balance                     = fields.BigIntField(default=0)
    smvk_balance                    = fields.BigIntField(default=0)
    participation_fees_per_share    = fields.FloatField(default=0)
    doorman                         = fields.ForeignKeyField('models.Doorman', related_name='stake_accounts', null=True)
    council                         = fields.ForeignKeyField('models.Council', related_name='council_members', null=True)

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
    satellite_record                = fields.ForeignKeyField('models.SatelliteRecord', related_name='delegation_records', null=True)
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

class CouncilActionRecord(Model):
    id                              = fields.BigIntField(pk=True)
    council                         = fields.ForeignKeyField('models.Council', related_name='council_action_records')
    initiator                       = fields.ForeignKeyField('models.MavrykUser', related_name='council_actions_initiator')
    start_datetime                  = fields.DatetimeField()
    start_level                     = fields.BigIntField(default=0)
    executed_datetime               = fields.DatetimeField()
    executed_level                  = fields.BigIntField(default=0)
    expiration_datetime             = fields.DatetimeField()
    action_type                     = fields.CharField(max_length=48)
    status                          = fields.IntEnumField(enum_type=ActionStatus)
    executed                        = fields.BooleanField(default=False)

    class Meta:
        table = 'council_action_record'

class CouncilActionRecordParameter(Model):
    id                              = fields.BigIntField(pk=True)
    council_action_record           = fields.ForeignKeyField('models.CouncilActionRecord', related_name='council_action_record_parameters')
    name                            = fields.CharField(max_length=255)
    value                           = fields.CharField(max_length=255)

    class Meta:
        table = 'council_action_record_parameter'

class VestingVesteeRecord(Model):
    id                              = fields.BigIntField(pk=True)
    vesting                         = fields.ForeignKeyField('models.Vesting', related_name='vesting_vestee_records')
    vestee                          = fields.ForeignKeyField('models.MavrykUser', related_name='vesting_vestee_record')
    total_allocated_amount          = fields.BigIntField(default=0)
    claim_amount_per_month          = fields.BigIntField(default=0)
    start_timestamp                 = fields.DatetimeField()
    vesting_months                  = fields.BigIntField(default=0)
    cliff_months                    = fields.BigIntField(default=0)
    end_cliff_timestamp             = fields.DatetimeField()
    end_vesting_timestamp           = fields.DatetimeField()
    locked                          = fields.BooleanField(default=False)
    total_remainder                 = fields.BigIntField(default=0)
    total_claimed                   = fields.BigIntField(default=0)
    months_claimed                  = fields.BigIntField(default=0)
    months_remaining                = fields.BigIntField(default=0)
    next_redemption_timestamp       = fields.DatetimeField()
    last_claimed_timestamp          = fields.DatetimeField()

    class Meta:
        table = 'vesting_vestee_record'

class VestingClaimRecord(Model):
    id                              = fields.BigIntField(pk=True)
    vesting                         = fields.ForeignKeyField('models.Vesting', related_name='vesting_claim_records')
    user                            = fields.ForeignKeyField('models.MavrykUser', related_name='vesting_claim_record')
    timestamp                       = fields.DatetimeField()
    amount_claimed                  = fields.BigIntField(default=0)
    remainder_vested                = fields.BigIntField(default=0)

    class Meta:
        table = 'vesting_claim_record'

class EmergencyGovernanceRecord(Model):
    id                              = fields.BigIntField(pk=True)
    emergency_governance            = fields.ForeignKeyField('models.EmergencyGovernance', related_name='emergency_governance_records')
    proposer                        = fields.ForeignKeyField('models.MavrykUser', related_name='emergency_governance_proposer')
    status                          = fields.BooleanField(default=False)
    executed                        = fields.BooleanField(default=False)
    dropped                         = fields.BooleanField(default=False)
    title                           = fields.CharField(max_length=255)
    description                     = fields.CharField(max_length=255)
    smvk_percentage_required        = fields.BigIntField(default=0)
    smvk_required_for_trigger       = fields.BigIntField(default=0)
    start_timestamp                 = fields.DatetimeField()
    executed_timestamp              = fields.DatetimeField()
    expiration_timestamp            = fields.DatetimeField()

    class Meta:
        table = 'emergency_governance_record'

class EmergencyGovernanceVote(Model):
    id                              = fields.BigIntField(pk=True)
    timestamp                       = fields.DatetimeField()
    emergency_governance_record     = fields.ForeignKeyField('models.EmergencyGovernanceRecord', related_name='voters')
    voter                           = fields.ForeignKeyField('models.MavrykUser', related_name='emergency_governance_votes')
    smvk_amount                     = fields.BigIntField(default=0)

    class Meta:
        table = 'emergency_governance_vote'
