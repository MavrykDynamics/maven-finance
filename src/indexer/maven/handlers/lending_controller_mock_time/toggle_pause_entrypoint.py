from maven.utils.error_reporting import save_error_report

from maven.types.lending_controller_mock_time.tezos_storage import LendingControllerMockTimeStorage
from maven.types.lending_controller_mock_time.tezos_parameters.toggle_pause_entrypoint import TogglePauseEntrypointParameter
from dipdup.models.tezos_tzkt import TzktTransaction
from dipdup.context import HandlerContext
import maven.models as models

async def toggle_pause_entrypoint(
    ctx: HandlerContext,
    toggle_pause_entrypoint: TzktTransaction[TogglePauseEntrypointParameter, LendingControllerMockTimeStorage],
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
        await models.LendingController.filter(
            network         = ctx.datasource.name.replace('mvkt_',''),
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

