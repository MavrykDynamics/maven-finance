from dipdup.models import Model, fields
from mavryk.sql_model.parents import LinkedContract, ContractLambda, MavrykContract
from mavryk.sql_model.enums import SatelliteStatus

###
# Delegation Tables
###

class Delegation(MavrykContract, Model):
    governance                              = fields.ForeignKeyField('models.Governance', related_name='delegations')
    minimum_smvk_balance                    = fields.FloatField(default=0)
    delegation_ratio                        = fields.SmallIntField(default=0)
    max_satellites                          = fields.SmallIntField(default=0)
    satellite_name_max_length               = fields.SmallIntField(default=0)
    satellite_description_max_length        = fields.SmallIntField(default=0)
    satellite_image_max_length              = fields.SmallIntField(default=0)
    satellite_website_max_length            = fields.SmallIntField(default=0)
    delegate_to_satellite_paused            = fields.BooleanField(default=False)
    undelegate_from_satellite_paused        = fields.BooleanField(default=False)
    register_as_satellite_paused            = fields.BooleanField(default=False)
    unregister_as_satellite_paused          = fields.BooleanField(default=False)
    update_satellite_record_paused          = fields.BooleanField(default=False)
    distribute_reward_paused                = fields.BooleanField(default=False)

    class Meta:
        table = 'delegation'

class DelegationLambda(ContractLambda, Model):
    contract                                 = fields.ForeignKeyField('models.Delegation', related_name='lambdas')

    class Meta:
        table = 'delegation_lambda'

class DelegationGeneralContract(LinkedContract, Model):
    contract                                 = fields.ForeignKeyField('models.Delegation', related_name='general_contracts')

    class Meta:
        table = 'delegation_general_contract'

class DelegationWhitelistContract(LinkedContract, Model):
    contract                                 = fields.ForeignKeyField('models.Delegation', related_name='whitelist_contracts')

    class Meta:
        table = 'delegation_whitelist_contract'

class SatelliteRewards(Model):
    id                                      = fields.BigIntField(pk=True, default=0)
    user                                    = fields.ForeignKeyField('models.MavrykUser', related_name='satellite_rewardss', index=True)
    reference                               = fields.ForeignKeyField('models.SatelliteRewards', related_name='satellite_references', null=True, index=True)
    delegation                              = fields.ForeignKeyField('models.Delegation', related_name='satellite_rewardss')
    unpaid                                  = fields.FloatField(default=0)
    paid                                    = fields.FloatField(default=0)
    participation_rewards_per_share         = fields.FloatField(default=0)
    satellite_accumulated_reward_per_share  = fields.FloatField(default=0)

    class Meta:
        table = 'satellite_rewards'

class Satellite(Model):
    id                                      = fields.BigIntField(pk=True, default=0)
    user                                    = fields.ForeignKeyField('models.MavrykUser', related_name='satellites', index=True)
    delegation                              = fields.ForeignKeyField('models.Delegation', related_name='satellites')
    public_key                              = fields.CharField(max_length=54, null=True)
    peer_id                                 = fields.TextField(null=True)
    status                                  = fields.IntEnumField(enum_type=SatelliteStatus, default=SatelliteStatus.ACTIVE, index=True)
    fee                                     = fields.SmallIntField(default=0)
    name                                    = fields.TextField(default="")
    description                             = fields.TextField(default="")
    image                                   = fields.TextField(default="")
    website                                 = fields.TextField(default="")
    registration_timestamp                  = fields.DatetimeField(auto_now=True)
    currently_registered                    = fields.BooleanField(default=True, index=True)
    total_delegated_amount                  = fields.FloatField(default=0.0)

    class Meta:
        table = 'satellite'

class DelegationRecord(Model):
    id                                      = fields.BigIntField(pk=True)
    satellite                               = fields.ForeignKeyField('models.Satellite', related_name='delegations', index=True)
    user                                    = fields.ForeignKeyField('models.MavrykUser', related_name='delegations', index=True)
    delegation                              = fields.ForeignKeyField('models.Delegation', related_name='delegations')
    satellite_registration_timestamp        = fields.DatetimeField(auto_now=True)

    class Meta:
        table = 'delegation_record'