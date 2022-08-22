from tortoise import Model, fields
from mavryk.sql_model.parents import LinkedContract, ContractLambda
from mavryk.sql_model.enums import SatelliteStatus

###
# Delegation Tables
###

class Delegation(Model):
    address                                 = fields.CharField(pk=True, max_length=36)
    admin                                   = fields.CharField(max_length=36)
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

class SatelliteRewardsRecord(Model):
    id                                      = fields.BigIntField(pk=True, default=0)
    user                                    = fields.ForeignKeyField('models.MavrykUser', related_name='satellite_rewards_records')
    reference                               = fields.ForeignKeyField('models.SatelliteRewardsRecord', related_name='satellite_references', null=True)
    delegation                              = fields.ForeignKeyField('models.Delegation', related_name='satellite_rewards_records')
    unpaid                                  = fields.FloatField(default=0)
    paid                                    = fields.FloatField(default=0)
    participation_rewards_per_share         = fields.FloatField(default=0)
    satellite_accumulated_reward_per_share  = fields.FloatField(default=0)

    class Meta:
        table = 'satellite_rewards_record'

class SatelliteRecord(Model):
    id                                      = fields.BigIntField(pk=True, default=0)
    user                                    = fields.ForeignKeyField('models.MavrykUser', related_name='satellite_record')
    delegation                              = fields.ForeignKeyField('models.Delegation', related_name='satellite_records')
    status                                  = fields.IntEnumField(enum_type=SatelliteStatus, default=SatelliteStatus.ACTIVE)
    fee                                     = fields.SmallIntField(default=0)
    name                                    = fields.TextField(default="")
    description                             = fields.TextField(default="")
    image                                   = fields.TextField(default="")
    website                                 = fields.TextField(default="")
    currently_registered                    = fields.BooleanField(default=True)

    class Meta:
        table = 'satellite_record'

class DelegationRecord(Model):
    id                                      = fields.BigIntField(pk=True)
    satellite_record                        = fields.ForeignKeyField('models.SatelliteRecord', related_name='delegation_records', null=True)
    user                                    = fields.ForeignKeyField('models.MavrykUser', related_name='delegation_records')
    delegation                              = fields.ForeignKeyField('models.Delegation', related_name='delegation_records')

    class Meta:
        table = 'delegation_record'