from mavryk.utils.error_reporting import save_error_report

from mavryk.types.doorman.storage import DoormanStorage
from mavryk.types.doorman.parameter.toggle_pause_entrypoint import TogglePauseEntrypointParameter
from dipdup.models import Transaction
from dipdup.context import HandlerContext
import mavryk.models as models

async def on_doorman_toggle_pause_entrypoint(
    ctx: HandlerContext,
    toggle_pause_entrypoint: Transaction[TogglePauseEntrypointParameter, DoormanStorage],
) -> None:

    try:
        # Get doorman contract
        doorman_address = toggle_pause_entrypoint.data.target_address
    
        # Update doorman
        await models.Doorman.filter(network=ctx.datasource.network, address=doorman_address).update(
            stake_paused                    = toggle_pause_entrypoint.storage.breakGlassConfig.stakeIsPaused,
            unstake_paused                  = toggle_pause_entrypoint.storage.breakGlassConfig.unstakeIsPaused,
            compound_paused                 = toggle_pause_entrypoint.storage.breakGlassConfig.compoundIsPaused,
            farm_claim_paused               = toggle_pause_entrypoint.storage.breakGlassConfig.farmClaimIsPaused,
            on_vault_deposit_stake_paused   = toggle_pause_entrypoint.storage.breakGlassConfig.onVaultDepositStakeIsPaused,
            on_vault_withdraw_stake_paused  = toggle_pause_entrypoint.storage.breakGlassConfig.onVaultWithdrawStakeIsPaused,
            on_vault_liquidate_stake_paused = toggle_pause_entrypoint.storage.breakGlassConfig.onVaultLiquidateStakeIsPaused
        )

    except BaseException as e:
         await save_error_report(e)

