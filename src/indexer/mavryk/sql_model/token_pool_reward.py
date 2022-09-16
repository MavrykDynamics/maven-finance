from dipdup.models import Model, fields
from mavryk.sql_model.parents import ContractLambda, MavrykContract, LinkedContract

###
# Token Pool Reward Tables
###

class TokenPoolReward(MavrykContract, Model):
    governance                              = fields.ForeignKeyField('models.Governance', related_name='token_pool_reward_rewards', null=True)
    update_reward_paused                    = fields.BooleanField(default=False)
    claim_reward_paused                     = fields.BooleanField(default=False)

    class Meta:
        table = 'token_pool_reward'

class TokenPoolRewardGeneralContract(LinkedContract, Model):
    contract                                 = fields.ForeignKeyField('models.TokenPoolReward', related_name='general_contracts')

    class Meta:
        table = 'token_pool_reward_general_contract'

class TokenPoolRewardWhitelistContract(LinkedContract, Model):
    contract                                 = fields.ForeignKeyField('models.TokenPoolReward', related_name='whitelist_contracts')

    class Meta:
        table = 'token_pool_reward_whitelist_contract'

class TokenPoolRewardWhitelistTokenContract(LinkedContract, Model):
    contract                                 = fields.ForeignKeyField('models.TokenPoolReward', related_name='whitelist_token_contracts')

    class Meta:
        table = 'token_pool_reward_whitelist_token_contract'

class TokenPoolRewardReward(Model):
    id                                      = fields.BigIntField(pk=True, default=0)
    token_pool_reward                       = fields.ForeignKeyField('models.TokenPoolReward', related_name='rewards', null=True)
    token_name                              = fields.CharField(default="", max_length=36)
    unpaid                                  = fields.FloatField(default=0.0)
    paid                                    = fields.FloatField(default=0.0)
    rewards_per_share                       = fields.FloatField(default=0.0)

    class Meta:
        table = 'token_pool_reward_reward'