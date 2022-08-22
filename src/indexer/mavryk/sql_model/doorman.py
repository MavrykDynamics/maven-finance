from tortoise import Model, fields
from mavryk.sql_model.parents import LinkedContract, ContractLambda
from mavryk.sql_model.enums import StakeType

###
# Doorman Tables
###

class Doorman(Model):
    address                                 = fields.CharField(pk=True, max_length=36)
    admin                                   = fields.CharField(max_length=36)
    governance                              = fields.ForeignKeyField('models.Governance', related_name='doormans')
    min_mvk_amount                          = fields.FloatField(default=0)
    unclaimed_rewards                       = fields.FloatField(default=0)
    accumulated_fees_per_share              = fields.FloatField(default=0)
    stake_paused                            = fields.BooleanField(default=False)
    unstake_paused                          = fields.BooleanField(default=False)
    compound_paused                         = fields.BooleanField(default=False)
    farm_claimed_paused                     = fields.BooleanField(default=False)

    class Meta:
        table = 'doorman'

class DoormanLambda(ContractLambda, Model):
    contract                                = fields.ForeignKeyField('models.Doorman', related_name='lambdas')

    class Meta:
        table = 'doorman_lambda'

class DoormanGeneralContract(LinkedContract, Model):
    contract                                 = fields.ForeignKeyField('models.Doorman', related_name='general_contracts')

    class Meta:
        table = 'doorman_general_contract'

class DoormanWhitelistContract(LinkedContract, Model):
    contract                                 = fields.ForeignKeyField('models.Doorman', related_name='whitelist_contracts')

    class Meta:
        table = 'doorman_whitelist_contract'

class DoormanStakeAccount(Model):
    id                                      = fields.BigIntField(pk=True, default=0)
    user                                    = fields.ForeignKeyField('models.MavrykUser', related_name='doorman_stake_account', index=True)
    doorman                                 = fields.ForeignKeyField('models.Doorman', related_name='stake_accounts', null=True)
    participation_fees_per_share            = fields.FloatField(default=0)
    smvk_balance                            = fields.FloatField(default=0)

    class Meta:
        table = 'doorman_stake_account'

class StakeHistoryData(Model):
    id                                      = fields.BigIntField(pk=True)
    doorman                                 = fields.ForeignKeyField('models.Doorman', related_name='stake_records')
    from_                                   = fields.ForeignKeyField('models.MavrykUser', related_name='stake_records')
    timestamp                               = fields.DatetimeField()
    type                                    = fields.IntEnumField(enum_type=StakeType)
    mvk_loyalty_index                       = fields.BigIntField(default=0.0)
    desired_amount                          = fields.FloatField(default=0.0)
    final_amount                            = fields.FloatField(default=0.0)

    class Meta:
        table = 'stake_history_data'

class SMVKHistoryData(Model):
    id                                      = fields.BigIntField(pk=True)
    doorman                                 = fields.ForeignKeyField('models.Doorman', related_name='smvk_history_data')
    timestamp                               = fields.DatetimeField()
    smvk_total_supply                       = fields.FloatField(default=0.0)
    avg_smvk_by_user                        = fields.FloatField(default=0.0)

    class Meta:
        table = 'smvk_history_data'
