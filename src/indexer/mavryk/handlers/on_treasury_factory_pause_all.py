from mavryk.utils.error_reporting import save_error_report

from mavryk.types.treasury_factory.storage import TreasuryFactoryStorage
from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.treasury_factory.parameter.pause_all import PauseAllParameter
import mavryk.models as models

async def on_treasury_factory_pause_all(
    ctx: HandlerContext,
    pause_all: Transaction[PauseAllParameter, TreasuryFactoryStorage],
) -> None:

    try:
        # Get operation info
        treasury_factory_address    = pause_all.data.target_address
        treasury_factory            = await models.TreasuryFactory.get(address=treasury_factory_address)
    
        # Update record
        treasury_factory.create_treasury_paused     = pause_all.storage.breakGlassConfig.createTreasuryIsPaused
        treasury_factory.track_treasury_paused      = pause_all.storage.breakGlassConfig.trackTreasuryIsPaused
        treasury_factory.untrack_treasury_paused    = pause_all.storage.breakGlassConfig.untrackTreasuryIsPaused
        await treasury_factory.save()

    except BaseException as e:
         await save_error_report(e)

