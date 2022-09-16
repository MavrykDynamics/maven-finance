from .enums import OracleType
from dipdup.models import Model, fields
from mavryk.sql_model.parents import LinkedContract, ContractLambda, MavrykContract

###
# Lending Controller Tables
###

class LendingController(MavrykContract, Model):
    governance                              = fields.ForeignKeyField('models.Governance', related_name='lending_controllers', null=True)
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
    update_collateral_token_paused          = fields.BooleanField(default=False)
    vault_deposit_smvk_paused               = fields.BooleanField(default=False)
    vault_withdraw_smvk_paused              = fields.BooleanField(default=False)
    vault_liquidate_smvk_paused             = fields.BooleanField(default=False)
    vault_delegate_tez_to_baker_paused      = fields.BooleanField(default=False)
    vault_delegate_mvk_to_satellite_paused  = fields.BooleanField(default=False)
    vault_deposit_paused                    = fields.BooleanField(default=False)
    vault_withdraw_paused                   = fields.BooleanField(default=False)
    vault_update_depositor_paused           = fields.BooleanField(default=False)

    class Meta:
        table = 'lending_controller'

class LendingControllerLambda(ContractLambda, Model):
    contract                                = fields.ForeignKeyField('models.LendingController', related_name='lambdas')

    class Meta:
        table = 'lending_controller_lambda'

class LendingControllerGeneralContract(LinkedContract, Model):
    contract                                = fields.ForeignKeyField('models.LendingController', related_name='general_contracts')

    class Meta:
        table = 'lending_controller_general_contract'

class LendingControllerWhitelistContract(LinkedContract, Model):
    contract                                = fields.ForeignKeyField('models.LendingController', related_name='whitelist_contracts')

    class Meta:
        table = 'lending_controller_whitelist_contract'

class LendingControllerWhitelistTokenContract(LinkedContract, Model):
    contract                                = fields.ForeignKeyField('models.LendingController', related_name='whitelist_token_contracts')

    class Meta:
        table = 'lending_controller_whitelist_token_contract'

class LendingControllerVaultHandle(Model):
    id                                      = fields.BigIntField(pk=True, default=0)
    lending_controller                      = fields.ForeignKeyField('models.LendingController', related_name='vault_handles', null=True)
    lending_controller_vault                = fields.ForeignKeyField('models.LendingControllerVault', related_name='vault_handles', null=True)
    owner                                   = fields.ForeignKeyField('models.MavrykUser', related_name='lending_controller_vault_owners', null=True)
    internal_id                             = fields.BigIntField(default=0)

    class Meta:
        table = 'lending_controller_vault_handle'

class LendingControllerVault(Model):
    id                                      = fields.BigIntField(pk=True, default=0)
    vault                                   = fields.ForeignKeyField('models.Vault', related_name='lending_controller_vaults', null=True)
    loan_token                              = fields.CharField(default="", max_length=36)
    loan_outstanding_total                  = fields.FloatField(default=0.0)
    loan_principal_total                    = fields.FloatField(default=0.0)
    loan_interest_total                     = fields.FloatField(default=0.0)
    loan_decimals                           = fields.SmallIntField(default=0)
    borrow_index                            = fields.BigIntField(default=0)
    last_updated_block_level                = fields.BigIntField(default=0)
    last_updated_timestamp                  = fields.DatetimeField(null=True)

    class Meta:
        table = 'lending_controller_vault'

class LendingControllerVaultCollateralBalance(Model):
    id                                      = fields.BigIntField(pk=True, default=0)
    lending_controller_vault                = fields.ForeignKeyField('models.LendingControllerVault', related_name='collateral_balances', null=True)
    collateral_name                         = fields.CharField(default="", max_length=36)
    collateral_balance                      = fields.FloatField(default=0.0)

    class Meta:
        table = 'lending_controller_vault_collateral_balance'

class LendingControllerDepositor(Model):
    id                                      = fields.BigIntField(pk=True, default=0)
    lending_controller                      = fields.ForeignKeyField('models.LendingController', related_name='depositors', null=True)
    depositor                               = fields.ForeignKeyField('models.MavrykUser', related_name='lending_controller_depositors', null=True)
    token_name                              = fields.CharField(default="", max_length=36)
    deposited_amount                        = fields.FloatField(default=0.0)

    class Meta:
        table = 'lending_controller_depositor'

class LendingControllerCollateralToken(Model):
    id                                      = fields.BigIntField(pk=True, default=0)
    lending_controller                      = fields.ForeignKeyField('models.LendingController', related_name='collateral_tokens', null=True)
    token                                   = fields.ForeignKeyField('models.Token', related_name='lending_controller_collateral_tokens', null=True)
    oracle_type                             = fields.IntEnumField(enum_type=OracleType, default=OracleType.CFMM)

    class Meta:
        table = 'lending_controller_collateral_token'

class LendingControllerLoanToken(Model):
    id                                      = fields.BigIntField(pk=True, default=0)
    lending_controller                      = fields.ForeignKeyField('models.LendingController', related_name='loan_tokens', null=True)
    loan_token                              = fields.ForeignKeyField('models.Token', related_name='lending_controller_loan_loan_tokens', null=True)
    lp_token                                = fields.ForeignKeyField('models.Token', related_name='lending_controller_loan_lp_tokens', null=True)
    lp_token_total                          = fields.FloatField(default=0.0)
    reserve_ratio                           = fields.SmallIntField(default=0)
    token_pool_total                        = fields.FloatField(default=0.0)
    total_borrowed                          = fields.FloatField(default=0.0)
    total_remaining                         = fields.FloatField(default=0.0)
    utilisation_rate                        = fields.SmallIntField(default=0)
    optimal_utilisation_rate                = fields.SmallIntField(default=0)
    base_interest_rate                      = fields.SmallIntField(default=0)
    max_interest_rate                       = fields.SmallIntField(default=0)
    interest_rate_below_optimal_utilisation = fields.SmallIntField(default=0)
    interest_rate_above_optimal_utilisation = fields.SmallIntField(default=0)
    current_interest_rate                   = fields.SmallIntField(default=0)
    last_updated_block_level                = fields.BigIntField(default=0)
    accumulated_rewards_per_share           = fields.FloatField(default=0.0)
    borrow_index                            = fields.BigIntField(default=0)

    class Meta:
        table = 'lending_controller_loan_token'
