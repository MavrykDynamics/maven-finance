
from mavryk.types.doorman.storage import DoormanStorage
from mavryk.types.doorman.parameter.toggle_pause_entrypoint import TogglePauseEntrypointParameter
from dipdup.models import Transaction
from dipdup.context import HandlerContext
import mavryk.models as models

async def on_doorman_toggle_pause_entrypoint(
    ctx: HandlerContext,
    toggle_pause_entrypoint: Transaction[TogglePauseEntrypointParameter, DoormanStorage],
) -> None:

    # Get doorman contract
    doorman_address = toggle_pause_entrypoint.data.target_address
    doorman         = await models.Doorman.get(address=doorman_address)

    # Update doorman
    doorman.stake_paused                    = toggle_pause_entrypoint.storage.breakGlassConfig.stakeIsPaused
    doorman.unstake_paused                  = toggle_pause_entrypoint.storage.breakGlassConfig.unstakeIsPaused
    doorman.compound_paused                 = toggle_pause_entrypoint.storage.breakGlassConfig.compoundIsPaused
    doorman.farm_claim_paused               = toggle_pause_entrypoint.storage.breakGlassConfig.farmClaimIsPaused
    doorman.on_vault_deposit_smvk_paused    = toggle_pause_entrypoint.storage.breakGlassConfig.onVaultDepositStakedMvkIsPaused
    doorman.on_vault_withdraw_smvk_paused   = toggle_pause_entrypoint.storage.breakGlassConfig.onVaultWithdrawStakedMvkIsPaused
    doorman.on_vault_liquidate_smvk_paused  = toggle_pause_entrypoint.storage.breakGlassConfig.onVaultLiquidateStakedMvkIsPaused
    await doorman.save()