from dipdup.models import Model, fields
from maven.models.parents import LinkedContract, ContractLambda, MavenContract
from maven.models.enums import StakeType

###
# Doorman Tables
###

class Doorman(MavenContract, Model):
    governance                              = fields.ForeignKeyField('models.Governance', related_name='doormans')
    min_mvn_amount                          = fields.FloatField(default=0)
    unclaimed_rewards                       = fields.FloatField(default=0)
    accumulated_fees_per_share              = fields.FloatField(default=0)
    stake_mvn_paused                        = fields.BooleanField(default=False)
    unstake_mvn_paused                      = fields.BooleanField(default=False)
    compound_paused                         = fields.BooleanField(default=False)
    exit_paused                             = fields.BooleanField(default=False)
    farm_claim_paused                       = fields.BooleanField(default=False)
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
    contract_name                           = fields.CharField(max_length=36, default="")

    class Meta:
        table = 'doorman_general_contract'

class DoormanWhitelistContract(LinkedContract, Model):
    contract                                 = fields.ForeignKeyField('models.Doorman', related_name='whitelist_contracts')

    class Meta:
        table = 'doorman_whitelist_contract'

class DoormanStakeAccount(Model):
    id                                      = fields.BigIntField(pk=True, default=0)
    user                                    = fields.ForeignKeyField('models.MavenUser', related_name='doorman_stake_accounts')
    doorman                                 = fields.ForeignKeyField('models.Doorman', related_name='stake_accounts')
    participation_fees_per_share            = fields.FloatField(default=0)
    total_exit_fee_rewards_claimed          = fields.FloatField(default=0)
    total_satellite_rewards_claimed         = fields.FloatField(default=0)
    total_farm_rewards_claimed              = fields.FloatField(default=0)
    smvn_balance                            = fields.FloatField(default=0)

    class Meta:
        table = 'doorman_stake_account'

class StakeHistoryData(Model):
    id                                      = fields.BigIntField(pk=True)
    doorman                                 = fields.ForeignKeyField('models.Doorman', related_name='stakes_history_data')
    from_                                   = fields.ForeignKeyField('models.MavenUser', related_name='stakes_history_data')
    timestamp                               = fields.DatetimeField()
    type                                    = fields.IntEnumField(enum_type=StakeType, index=True)
    desired_amount                          = fields.FloatField(default=0.0)
    final_amount                            = fields.FloatField(default=0.0)

    class Meta:
        table = 'stake_history_data'

class SMVNHistoryData(Model):
    id                                      = fields.BigIntField(pk=True)
    doorman                                 = fields.ForeignKeyField('models.Doorman', related_name='stakes_mvn_history_data')
    level                                   = fields.BigIntField(default=0)
    timestamp                               = fields.DatetimeField()
    smvn_total_supply                       = fields.FloatField(default=0.0)
    mvn_total_supply                        = fields.FloatField(default=0.0)
    avg_smvn_per_user                        = fields.FloatField(default=0.0)

    class Meta:
        table = 'smvn_history_data'
