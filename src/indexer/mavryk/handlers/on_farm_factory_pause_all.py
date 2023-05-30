from mavryk.utils.error_reporting import save_error_report

from dipdup.context import HandlerContext
from mavryk.types.farm_factory.parameter.pause_all import PauseAllParameter
from mavryk.types.farm_factory.storage import FarmFactoryStorage
from dipdup.models import Transaction
import mavryk.models as models

async def on_farm_factory_pause_all(
    ctx: HandlerContext,
    pause_all: Transaction[PauseAllParameter, FarmFactoryStorage],
) -> None:

    try:
        # Get operation info
        farm_factory_address    = pause_all.data.target_address
    
        # Update record
        await models.FarmFactory.filter(network=ctx.datasource.network, address=farm_factory_address).update(
            create_farm_paused         = pause_all.storage.breakGlassConfig.createFarmIsPaused,
            create_farm_m_token_paused = pause_all.storage.breakGlassConfig.createFarmMTokenIsPaused,
            track_farm_paused          = pause_all.storage.breakGlassConfig.trackFarmIsPaused,
            untrack_farm_paused        = pause_all.storage.breakGlassConfig.untrackFarmIsPaused
        )

    except BaseException as e:
         await save_error_report(e)

