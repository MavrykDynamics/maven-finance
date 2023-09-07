from dipdup.models import Model, fields
from mavryk.models.parents import LinkedContract, ContractLambda, MavrykContract

###
# Farm Tables
###

class Farm(MavrykContract, Model):
    governance                              = fields.ForeignKeyField('models.Governance', related_name='farms')
    factory                                 = fields.ForeignKeyField('models.FarmFactory', related_name='farms', null=True)
    lp_token                                = fields.ForeignKeyField('models.Token', related_name='farms_lp_tokens')
    loan_token_name                         = fields.CharField(max_length=36, null=True)
    token0                                  = fields.ForeignKeyField('models.Token', related_name='farms_tokens_0', null=True)
    token1                                  = fields.ForeignKeyField('models.Token', related_name='farms_tokens_1', null=True)
    creation_timestamp                      = fields.DatetimeField()
    start_timestamp                         = fields.DatetimeField(null=True)
    end_timestamp                           = fields.DatetimeField(null=True)
    name                                    = fields.TextField(default='')
    force_rewards_from_transfer             = fields.BooleanField(default=False)
    infinite                                = fields.BooleanField(default=False)
    lp_token_balance                        = fields.BigIntField(default=0)
    total_blocks                            = fields.BigIntField(default=0)
    current_reward_per_block                = fields.FloatField(default=0)
    total_rewards                           = fields.FloatField(default=0)
    deposit_paused                          = fields.BooleanField(default=False)
    withdraw_paused                         = fields.BooleanField(default=False)
    claim_paused                            = fields.BooleanField(default=False)
    last_block_update                       = fields.BigIntField(default=0)
    open                                    = fields.BooleanField(default=False)
    init                                    = fields.BooleanField(default=False)
    init_block                              = fields.BigIntField(default=0)
    accumulated_rewards_per_share           = fields.FloatField(default=0)
    unpaid_rewards                          = fields.FloatField(default=0)
    paid_rewards                            = fields.FloatField(default=0)
    min_block_time_snapshot                 = fields.SmallIntField(default=0)
    is_m_farm                               = fields.BooleanField(default=False)

    class Meta:
        table = 'farm'

class FarmLambda(ContractLambda, Model):
    contract                                = fields.ForeignKeyField('models.Farm', related_name='lambdas')

    class Meta:
        table = 'farm_lambda'

class FarmGeneralContract(LinkedContract, Model):
    contract                                 = fields.ForeignKeyField('models.Farm', related_name='general_contracts')
    contract_name                           = fields.CharField(max_length=36, default="")

    class Meta:
        table = 'farm_general_contract'

class FarmWhitelistContract(LinkedContract, Model):
    contract                                 = fields.ForeignKeyField('models.Farm', related_name='whitelist_contracts')

    class Meta:
        table = 'farm_whitelist_contract'

class FarmAccount(Model):
    id                                      = fields.BigIntField(pk=True, default=0)
    user                                    = fields.ForeignKeyField('models.MavrykUser', related_name='farm_accounts')
    farm                                    = fields.ForeignKeyField('models.Farm', related_name='farm_accounts')
    deposited_amount                        = fields.BigIntField(default=0)
    participation_rewards_per_share         = fields.FloatField(default=0)
    unclaimed_rewards                       = fields.FloatField(default=0)
    claimed_rewards                         = fields.FloatField(default=0)
    token_reward_index                      = fields.FloatField(null=True)

    class Meta:
        table = 'farm_account'
