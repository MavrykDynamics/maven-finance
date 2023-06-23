from dipdup.models import Model, fields
from .enums import LendingControllerOperationType
from mavryk.sql_model.parents import LinkedContract, ContractLambda, MavrykContract

###
# Lending Controller Tables
###

class LendingController(MavrykContract, Model):
    governance                              = fields.ForeignKeyField('models.Governance', related_name='lending_controllers')
    mock_time                               = fields.BooleanField(default=False)
    collateral_ratio                        = fields.SmallIntField(default=0)
    liquidation_ratio                       = fields.SmallIntField(default=0)
    liquidation_fee_pct                     = fields.SmallIntField(default=0)
    admin_liquidation_fee_pct               = fields.SmallIntField(default=0)
    minimum_loan_fee_pct                    = fields.SmallIntField(default=0)
    minimum_loan_treasury_share             = fields.SmallIntField(default=0)
    interest_treasury_share                 = fields.SmallIntField(default=0)
    decimals                                = fields.SmallIntField(default=0)
    interest_rate_decimals                  = fields.SmallIntField(default=0)
    max_decimals_for_calculation            = fields.SmallIntField(default=0)
    max_vault_liquidation_pct               = fields.SmallIntField(default=0)
    liquidation_delay_in_minutes            = fields.BigIntField(default=0)
    liquidation_max_duration                = fields.BigIntField(default=0)
    add_liquidity_paused                    = fields.BooleanField(default=False)
    remove_liquidity_paused                 = fields.BooleanField(default=False)
    register_vault_creation_paused          = fields.BooleanField(default=False)
    close_vault_paused                      = fields.BooleanField(default=False)
    register_deposit_paused                 = fields.BooleanField(default=False)
    register_withdrawal_paused              = fields.BooleanField(default=False)
    liquidate_vault_paused                  = fields.BooleanField(default=False)
    mark_for_liquidation_paused             = fields.BooleanField(default=False)
    borrow_paused                           = fields.BooleanField(default=False)
    repay_paused                            = fields.BooleanField(default=False)
    set_loan_token_paused                   = fields.BooleanField(default=False)
    set_collateral_token_paused             = fields.BooleanField(default=False)
    vault_deposit_staked_token_paused       = fields.BooleanField(default=False)
    vault_withdraw_staked_token_paused      = fields.BooleanField(default=False)
    vault_on_liquidate_paused               = fields.BooleanField(default=False)
    vault_deposit_paused                    = fields.BooleanField(default=False)
    vault_withdraw_paused                   = fields.BooleanField(default=False)

    class Meta:
        table = 'lending_controller'

class LendingControllerLambda(ContractLambda, Model):
    contract                                = fields.ForeignKeyField('models.LendingController', related_name='lambdas')

    class Meta:
        table = 'lending_controller_lambda'

class LendingControllerGeneralContract(LinkedContract, Model):
    contract                                = fields.ForeignKeyField('models.LendingController', related_name='general_contracts')
    contract_name                           = fields.CharField(max_length=36, default="")

    class Meta:
        table = 'lending_controller_general_contract'

class LendingControllerWhitelistContract(LinkedContract, Model):
    contract                                = fields.ForeignKeyField('models.LendingController', related_name='whitelist_contracts')

    class Meta:
        table = 'lending_controller_whitelist_contract'

class LendingControllerWhitelistTokenContract(LinkedContract, Model):
    contract                                = fields.ForeignKeyField('models.LendingController', related_name='whitelist_token_contracts')
    token                                   = fields.ForeignKeyField('models.Token', related_name='lending_controller_whitelist_token_contracts', index=True)

    class Meta:
        table = 'lending_controller_whitelist_token_contract'

class LendingControllerVault(Model):
    id                                      = fields.BigIntField(pk=True, default=0)
    internal_id                             = fields.BigIntField(default=0, index=True)
    lending_controller                      = fields.ForeignKeyField('models.LendingController', related_name='vaults')
    vault                                   = fields.ForeignKeyField('models.Vault', related_name='lending_controller_vaults', null=True, index=True)
    owner                                   = fields.ForeignKeyField('models.MavrykUser', related_name='lending_controller_vaults', index=True)
    loan_token                              = fields.ForeignKeyField('models.LendingControllerLoanToken', related_name='vaults', index=True)
    loan_outstanding_total                  = fields.FloatField(default=0.0)
    loan_principal_total                    = fields.FloatField(default=0.0)
    loan_interest_total                     = fields.FloatField(default=0.0)
    loan_decimals                           = fields.SmallIntField(default=0)
    borrow_index                            = fields.FloatField(default=0)
    last_updated_block_level                = fields.BigIntField(default=0, index=True)
    last_updated_timestamp                  = fields.DatetimeField(auto_now=True, index=True)
    marked_for_liquidation_level            = fields.BigIntField(default=0, index=True)
    liquidation_end_level                   = fields.BigIntField(default=0, index=True)
    open                                    = fields.BooleanField(default=True, index=True)

    class Meta:
        table = 'lending_controller_vault'

class LendingControllerVaultCollateralBalance(Model):
    id                                      = fields.BigIntField(pk=True, default=0)
    lending_controller_vault                = fields.ForeignKeyField('models.LendingControllerVault', related_name='collateral_balances')
    collateral_token                        = fields.ForeignKeyField('models.LendingControllerCollateralToken', related_name='balances')
    balance                                 = fields.FloatField(default=0.0)

    class Meta:
        table = 'lending_controller_vault_collateral_balance'

class LendingControllerCollateralToken(Model):
    id                                      = fields.BigIntField(pk=True, default=0)
    lending_controller                      = fields.ForeignKeyField('models.LendingController', related_name='collateral_tokens')
    oracle                                  = fields.ForeignKeyField('models.MavrykUser', related_name='lending_controller_collateral_token_oracles', index=True)
    token                                   = fields.ForeignKeyField('models.Token', related_name='lending_controller_collateral_tokens', index=True)
    protected                               = fields.BooleanField(default=False, index=True)
    is_scaled_token                         = fields.BooleanField(default=False, index=True)
    is_staked_token                         = fields.BooleanField(default=False, index=True)
    staking_contract_address                = fields.CharField(max_length=36, null=True)
    total_deposited                         = fields.FloatField(default=0.0)
    max_deposit_amount                      = fields.FloatField(null=True)
    token_name                              = fields.CharField(max_length=36, default="")
    paused                                  = fields.BooleanField(default=False, index=True)

    class Meta:
        table = 'lending_controller_collateral_token'

class LendingControllerLoanToken(Model):
    id                                      = fields.BigIntField(pk=True, default=0)
    lending_controller                      = fields.ForeignKeyField('models.LendingController', related_name='loan_tokens')
    m_token                                 = fields.ForeignKeyField('models.MToken', related_name='lending_controller_loan_tokens', index=True)
    oracle                                  = fields.ForeignKeyField('models.MavrykUser', related_name='lending_controller_loan_token_oracles', index=True)
    token                                   = fields.ForeignKeyField('models.Token', related_name='lending_controller_loan_tokens', index=True)
    loan_token_name                         = fields.CharField(max_length=36, default="", index=True)
    raw_m_tokens_total_supply    = fields.FloatField(default=0.0)
    reserve_ratio                           = fields.SmallIntField(default=0)
    token_pool_total                        = fields.FloatField(default=0.0)
    total_borrowed                          = fields.FloatField(default=0.0)
    total_remaining                         = fields.FloatField(default=0.0)
    utilisation_rate                        = fields.FloatField(default=0)
    optimal_utilisation_rate                = fields.FloatField(default=0)
    base_interest_rate                      = fields.FloatField(default=0)
    max_interest_rate                       = fields.FloatField(default=0)
    interest_rate_below_optimal_utilisation = fields.FloatField(default=0)
    interest_rate_above_optimal_utilisation = fields.FloatField(default=0)
    current_interest_rate                   = fields.FloatField(default=0)
    last_updated_block_level                = fields.BigIntField(default=0)
    token_reward_index                      = fields.FloatField(default=0.0)
    borrow_index                            = fields.FloatField(default=0)
    min_repayment_amount                    = fields.FloatField(default=0.0)
    paused                                  = fields.BooleanField(default=False, index=True)

    class Meta:
        table = 'lending_controller_loan_token'

class LendingControllerHistoryData(Model):
    id                                      = fields.BigIntField(pk=True)
    lending_controller                      = fields.ForeignKeyField('models.LendingController', related_name='history_data')
    vault                                   = fields.ForeignKeyField('models.LendingControllerVault', related_name='history_data', null=True)
    loan_token                              = fields.ForeignKeyField('models.LendingControllerLoanToken', related_name='history_data', null=True)
    collateral_token                        = fields.ForeignKeyField('models.LendingControllerCollateralToken', related_name='history_data', null=True)
    sender                                  = fields.ForeignKeyField('models.MavrykUser', related_name='lending_controller_history_data_sender', index=True)
    operation_hash                          = fields.CharField(max_length=51)
    timestamp                               = fields.DatetimeField(index=True)
    level                                   = fields.BigIntField(default=0)
    type                                    = fields.IntEnumField(enum_type=LendingControllerOperationType, index=True)
    amount                                  = fields.FloatField(default=0.0)

    class Meta:
        table = 'lending_controller_history_data'
