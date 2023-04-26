from dipdup.models import Model, fields
from mavryk.sql_model.parents import LinkedContract, ContractLambda, MavrykContract
from mavryk.sql_model.enums import StakeType

###
# Doorman Tables
###

class Doorman(MavrykContract, Model):
    governance                              = fields.ForeignKeyField('models.Governance', related_name='doormans')
    min_mvk_amount                          = fields.FloatField(default=0)
    unclaimed_rewards                       = fields.FloatField(default=0)
    accumulated_fees_per_share              = fields.FloatField(default=0)
    stake_paused                            = fields.BooleanField(default=False)
    unstake_paused                          = fields.BooleanField(default=False)
    compound_paused                         = fields.BooleanField(default=False)
    farm_claimed_paused                     = fields.BooleanField(default=False)
    on_vault_deposit_stake_paused           = fields.BooleanField(default=False)
    on_vault_withdraw_stake_paused          = fields.BooleanField(default=False)
    on_vault_liquidate_stake_paused         = fields.BooleanField(default=False)

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
    user                                    = fields.ForeignKeyField('models.MavrykUser', related_name='doorman_stake_accounts', index=True)
    doorman                                 = fields.ForeignKeyField('models.Doorman', related_name='stake_accounts', null=True)
    participation_fees_per_share            = fields.FloatField(default=0)
    total_exit_fee_rewards_claimed          = fields.FloatField(default=0)
    total_satellite_rewards_claimed         = fields.FloatField(default=0)
    total_farm_rewards_claimed              = fields.FloatField(default=0)
    smvk_balance                            = fields.FloatField(default=0)

    class Meta:
        table = 'doorman_stake_account'

class StakeHistoryData(Model):
    id                                      = fields.BigIntField(pk=True)
    doorman                                 = fields.ForeignKeyField('models.Doorman', related_name='stakes_history_data')
    from_                                   = fields.ForeignKeyField('models.MavrykUser', related_name='stakes_history_data', index=True)
    timestamp                               = fields.DatetimeField(index=True)
    type                                    = fields.IntEnumField(enum_type=StakeType, index=True)
    desired_amount                          = fields.FloatField(default=0.0)
    final_amount                            = fields.FloatField(default=0.0)

    class Meta:
        table = 'stake_history_data'

class SMVKHistoryData(Model):
    id                                      = fields.BigIntField(pk=True)
    doorman                                 = fields.ForeignKeyField('models.Doorman', related_name='stakes_mvk_history_data')
    level                                   = fields.BigIntField(default=0)
    timestamp                               = fields.DatetimeField(index=True)
    smvk_total_supply                       = fields.FloatField(default=0.0)
    mvk_total_supply                        = fields.FloatField(default=0.0)
    avg_smvk_by_user                        = fields.FloatField(default=0.0)

    class Meta:
        table = 'smvk_history_data'
