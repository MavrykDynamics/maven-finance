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
    
        # Update record
        await models.TreasuryFactory.filter(network=ctx.datasource.network, address=treasury_factory_address).update(
            create_treasury_paused     = toggle_pause_entrypoint.storage.breakGlassConfig.createTreasuryIsPaused,
            track_treasury_paused      = toggle_pause_entrypoint.storage.breakGlassConfig.trackTreasuryIsPaused,
            untrack_treasury_paused    = toggle_pause_entrypoint.storage.breakGlassConfig.untrackTreasuryIsPaused
        )

    except BaseException as e:
         await save_error_report(e)

