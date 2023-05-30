from mavryk.utils.error_reporting import save_error_report

from mavryk.types.treasury_factory.storage import TreasuryFactoryStorage
from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.treasury_factory.parameter.unpause_all import UnpauseAllParameter
import mavryk.models as models

async def on_treasury_factory_unpause_all(
    ctx: HandlerContext,
    unpause_all: Transaction[UnpauseAllParameter, TreasuryFactoryStorage],
) -> None:

    try:
        # Get operation info
        treasury_factory_address    = unpause_all.data.target_address
    
        # Update record
        await models.TreasuryFactory.filter(network=ctx.datasource.network, address=treasury_factory_address).update(
            create_treasury_paused     = unpause_all.storage.breakGlassConfig.createTreasuryIsPaused,
            track_treasury_paused      = unpause_all.storage.breakGlassConfig.trackTreasuryIsPaused,
            untrack_treasury_paused    = unpause_all.storage.breakGlassConfig.untrackTreasuryIsPaused
        )

    except BaseException as e:
         await save_error_report(e)

