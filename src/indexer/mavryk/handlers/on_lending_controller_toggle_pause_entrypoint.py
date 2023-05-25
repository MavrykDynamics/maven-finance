from mavryk.utils.error_reporting import save_error_report

from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.lending_controller.parameter.toggle_pause_entrypoint import TogglePauseEntrypointParameter
from mavryk.types.lending_controller.storage import LendingControllerStorage
import mavryk.models as models

async def on_lending_controller_toggle_pause_entrypoint(
    ctx: HandlerContext,
    toggle_pause_entrypoint: Transaction[TogglePauseEntrypointParameter, LendingControllerStorage],
) -> None:

    try:
        # Get operation info
        lending_controller_address              = toggle_pause_entrypoint.data.target_address
        add_liquidity_paused                    = toggle_pause_entrypoint.storage.breakGlassConfig.addLiquidityIsPaused
        remove_liquidity_paused                 = toggle_pause_entrypoint.storage.breakGlassConfig.removeLiquidityIsPaused
        register_vault_creation_paused          = toggle_pause_entrypoint.storage.breakGlassConfig.registerVaultCreationIsPaused
        close_vault_paused                      = toggle_pause_entrypoint.storage.breakGlassConfig.closeVaultIsPaused
        register_deposit_paused                 = toggle_pause_entrypoint.storage.breakGlassConfig.registerDepositIsPaused
        register_withdrawal_paused              = toggle_pause_entrypoint.storage.breakGlassConfig.registerWithdrawalIsPaused
        liquidate_vault_paused                  = toggle_pause_entrypoint.storage.breakGlassConfig.liquidateVaultIsPaused
        mark_for_liquidation_paused             = toggle_pause_entrypoint.storage.breakGlassConfig.markForLiquidationIsPaused
        borrow_paused                           = toggle_pause_entrypoint.storage.breakGlassConfig.borrowIsPaused
        repay_paused                            = toggle_pause_entrypoint.storage.breakGlassConfig.repayIsPaused
        set_loan_token_paused                   = toggle_pause_entrypoint.storage.breakGlassConfig.setLoanTokenIsPaused
        set_collateral_token_paused             = toggle_pause_entrypoint.storage.breakGlassConfig.setCollateralTokenIsPaused
        vault_deposit_staked_token_paused       = toggle_pause_entrypoint.storage.breakGlassConfig.vaultDepositStakedTokenIsPaused
        vault_withdraw_staked_token_paused      = toggle_pause_entrypoint.storage.breakGlassConfig.vaultWithdrawStakedTokenIsPaused
        vault_on_liquidate_paused               = toggle_pause_entrypoint.storage.breakGlassConfig.vaultOnLiquidateIsPaused
        vault_deposit_paused                    = toggle_pause_entrypoint.storage.breakGlassConfig.vaultDepositIsPaused
        vault_withdraw_paused                   = toggle_pause_entrypoint.storage.breakGlassConfig.vaultWithdrawIsPaused
    
        # Update record
        lending_controller           = await models.LendingController.get(
            network         = ctx.datasource.network,
            address         = lending_controller_address,
            mock_time       = False
        )
        lending_controller.add_liquidity_paused                     = add_liquidity_paused
        lending_controller.remove_liquidity_paused                  = remove_liquidity_paused
        lending_controller.register_vault_creation_paused           = register_vault_creation_paused
        lending_controller.close_vault_paused                       = close_vault_paused
        lending_controller.register_deposit_paused                  = register_deposit_paused
        lending_controller.register_withdrawal_paused               = register_withdrawal_paused
        lending_controller.liquidate_vault_paused                   = liquidate_vault_paused
        lending_controller.mark_for_liquidation_paused              = mark_for_liquidation_paused
        lending_controller.borrow_paused                            = borrow_paused
        lending_controller.repay_paused                             = repay_paused
        lending_controller.set_loan_token_paused                    = set_loan_token_paused
        lending_controller.set_collateral_token_paused              = set_collateral_token_paused
        lending_controller.vault_deposit_staked_token_paused        = vault_deposit_staked_token_paused
        lending_controller.vault_withdraw_staked_token_paused       = vault_withdraw_staked_token_paused
        lending_controller.vault_on_liquidate_paused                = vault_on_liquidate_paused
        lending_controller.vault_deposit_paused                     = vault_deposit_paused
        lending_controller.vault_withdraw_paused                    = vault_withdraw_paused
        await lending_controller.save()

    except BaseException as e:
         await save_error_report(e)

