from mavryk.utils.error_reporting import save_error_report

from mavryk.types.treasury_factory.storage import TreasuryFactoryStorage
from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.treasury_factory.parameter.pause_all import PauseAllParameter
import mavryk.models as models

async def pause_all(
    ctx: HandlerContext,
    pause_all: Transaction[PauseAllParameter, TreasuryFactoryStorage],
) -> None:

    try:
        # Get operation info
        treasury_factory_address    = pause_all.data.target_address
    
        # Update record
        await models.TreasuryFactory.filter(network=ctx.datasource.network, address=treasury_factory_address).update(
            create_treasury_paused     = pause_all.storage.breakGlassConfig.createTreasuryIsPaused,
            track_treasury_paused      = pause_all.storage.breakGlassConfig.trackTreasuryIsPaused,
            untrack_treasury_paused    = pause_all.storage.breakGlassConfig.untrackTreasuryIsPaused
        )

    except BaseException as e:
        await save_error_report(e)

