from mavryk.utils.error_reporting import save_error_report
from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.m_farm.parameter.toggle_pause_entrypoint import TogglePauseEntrypointParameter
from mavryk.types.m_farm.storage import MFarmStorage
import mavryk.models as models

async def on_m_farm_toggle_pause_entrypoint(
    ctx: HandlerContext,
    toggle_pause_entrypoint: Transaction[TogglePauseEntrypointParameter, MFarmStorage],
) -> None:

    try:
        # Get operation info
        farm_address    = toggle_pause_entrypoint.data.target_address
        farm            = await models.Farm.get(network=ctx.datasource.network, address=farm_address)
    
        # Update record
        farm.deposit_paused     = toggle_pause_entrypoint.storage.breakGlassConfig.depositIsPaused
        farm.withdraw_paused    = toggle_pause_entrypoint.storage.breakGlassConfig.withdrawIsPaused
        farm.claim_paused       = toggle_pause_entrypoint.storage.breakGlassConfig.claimIsPaused
        await farm.save()

    except BaseException as e:
         await save_error_report(e)

