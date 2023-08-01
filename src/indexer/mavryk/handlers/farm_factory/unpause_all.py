from mavryk.utils.error_reporting import save_error_report

from mavryk.types.farm_factory.storage import FarmFactoryStorage
from dipdup.context import HandlerContext
from mavryk.types.farm_factory.parameter.unpause_all import UnpauseAllParameter
from dipdup.models import Transaction
import mavryk.models as models

async def unpause_all(
    ctx: HandlerContext,
    unpause_all: Transaction[UnpauseAllParameter, FarmFactoryStorage],
) -> None:

    try:
        # Get operation info
        farm_factory_address    = unpause_all.data.target_address
    
        # Update record
        await models.FarmFactory.filter(network=ctx.datasource.network, address=farm_factory_address).update(
            create_farm_paused         = unpause_all.storage.breakGlassConfig.createFarmIsPaused,
            create_farm_m_token_paused = unpause_all.storage.breakGlassConfig.createFarmMTokenIsPaused,
            track_farm_paused          = unpause_all.storage.breakGlassConfig.trackFarmIsPaused,
            untrack_farm_paused        = unpause_all.storage.breakGlassConfig.untrackFarmIsPaused
        )

    except BaseException as e:
        await save_error_report(e)

