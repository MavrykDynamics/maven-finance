from maven.utils.error_reporting import save_error_report

from dipdup.context import HandlerContext
from maven.types.lending_controller.tezos_parameters.unpause_all import UnpauseAllParameter
from dipdup.models.tezos import TezosTransaction
from maven.types.lending_controller.tezos_storage import LendingControllerStorage
from maven import models as models

async def unpause_all(
    ctx: HandlerContext,
    unpause_all: TezosTransaction[UnpauseAllParameter, LendingControllerStorage],
) -> None:

    try:
        # Get operation info
        lending_controller_address              = unpause_all.data.target_address
        add_liquidity_paused                    = unpause_all.storage.breakGlassConfig.addLiquidityIsPaused
        remove_liquidity_paused                 = unpause_all.storage.breakGlassConfig.removeLiquidityIsPaused
        register_vault_creation_paused          = unpause_all.storage.breakGlassConfig.registerVaultCreationIsPaused
        close_vault_paused                      = unpause_all.storage.breakGlassConfig.closeVaultIsPaused
        register_deposit_paused                 = unpause_all.storage.breakGlassConfig.registerDepositIsPaused
        register_withdrawal_paused              = unpause_all.storage.breakGlassConfig.registerWithdrawalIsPaused
        liquidate_vault_paused                  = unpause_all.storage.breakGlassConfig.liquidateVaultIsPaused
        mark_for_liquidation_paused             = unpause_all.storage.breakGlassConfig.markForLiquidationIsPaused
        borrow_paused                           = unpause_all.storage.breakGlassConfig.borrowIsPaused
        repay_paused                            = unpause_all.storage.breakGlassConfig.repayIsPaused
        set_loan_token_paused                   = unpause_all.storage.breakGlassConfig.setLoanTokenIsPaused
        set_collateral_token_paused             = unpause_all.storage.breakGlassConfig.setCollateralTokenIsPaused
        vault_deposit_staked_token_paused       = unpause_all.storage.breakGlassConfig.vaultDepositStakedTokenIsPaused
        vault_withdraw_staked_token_paused      = unpause_all.storage.breakGlassConfig.vaultWithdrawStakedTokenIsPaused
        vault_on_liquidate_paused               = unpause_all.storage.breakGlassConfig.vaultOnLiquidateIsPaused
        vault_deposit_paused                    = unpause_all.storage.breakGlassConfig.vaultDepositIsPaused
        vault_withdraw_paused                   = unpause_all.storage.breakGlassConfig.vaultWithdrawIsPaused
    
        # Update record
        await models.LendingController.filter(
            network         = 'atlasnet',
            address         = lending_controller_address
        ).update(
            add_liquidity_paused                     = add_liquidity_paused,
            remove_liquidity_paused                  = remove_liquidity_paused,
            register_vault_creation_paused           = register_vault_creation_paused,
            close_vault_paused                       = close_vault_paused,
            register_deposit_paused                  = register_deposit_paused,
            register_withdrawal_paused               = register_withdrawal_paused,
            liquidate_vault_paused                   = liquidate_vault_paused,
            mark_for_liquidation_paused              = mark_for_liquidation_paused,
            borrow_paused                            = borrow_paused,
            repay_paused                             = repay_paused,
            set_loan_token_paused                    = set_loan_token_paused,
            set_collateral_token_paused              = set_collateral_token_paused,
            vault_deposit_staked_token_paused        = vault_deposit_staked_token_paused,
            vault_withdraw_staked_token_paused       = vault_withdraw_staked_token_paused,
            vault_on_liquidate_paused                = vault_on_liquidate_paused,
            vault_deposit_paused                     = vault_deposit_paused,
            vault_withdraw_paused                    = vault_withdraw_paused
        )

    except BaseException as e:
        await save_error_report(e)

