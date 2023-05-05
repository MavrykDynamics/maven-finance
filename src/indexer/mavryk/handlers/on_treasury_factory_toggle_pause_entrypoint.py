from mavryk.utils.error_reporting import save_error_report

from dipdup.models import Transaction
from mavryk.types.treasury_factory.storage import TreasuryFactoryStorage
from mavryk.types.treasury_factory.parameter.toggle_pause_entrypoint import TogglePauseEntrypointParameter
from dipdup.context import HandlerContext
import mavryk.models as models

async def on_treasury_factory_toggle_pause_entrypoint(
    ctx: HandlerContext,
    toggle_pause_entrypoint: Transaction[TogglePauseEntrypointParameter, TreasuryFactoryStorage],
) -> None:

    try:
        # Get operation info
        treasury_factory_address    = toggle_pause_entrypoint.data.target_address
        treasury_factory            = await models.TreasuryFactory.get(address=treasury_factory_address)
    
        # Update record
        treasury_factory.create_treasury_paused     = toggle_pause_entrypoint.storage.breakGlassConfig.createTreasuryIsPaused
        treasury_factory.track_treasury_paused      = toggle_pause_entrypoint.storage.breakGlassConfig.trackTreasuryIsPaused
        treasury_factory.untrack_treasury_paused    = toggle_pause_entrypoint.storage.breakGlassConfig.untrackTreasuryIsPaused
        await treasury_factory.save()
    except BaseException as e:
         await save_error_report(e)

