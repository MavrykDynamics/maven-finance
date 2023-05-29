from mavryk.utils.error_reporting import save_error_report

from mavryk.types.farm_factory.storage import FarmFactoryStorage
from dipdup.context import HandlerContext
from mavryk.types.farm_factory.parameter.unpause_all import UnpauseAllParameter
from dipdup.models import Transaction
import mavryk.models as models

async def on_farm_factory_unpause_all(
    ctx: HandlerContext,
    unpause_all: Transaction[UnpauseAllParameter, FarmFactoryStorage],
) -> None:

    try:
        # Get operation info
        farm_factory_address    = unpause_all.data.target_address
        farm_factory            = await models.FarmFactory.get(network=ctx.datasource.network, address=farm_factory_address)
    
        # Update record
        farm_factory.create_farm_paused         = unpause_all.storage.breakGlassConfig.createFarmIsPaused
        farm_factory.create_farm_m_token_paused = unpause_all.storage.breakGlassConfig.createFarmMTokenIsPaused
        farm_factory.track_farm_paused          = unpause_all.storage.breakGlassConfig.trackFarmIsPaused
        farm_factory.untrack_farm_paused        = unpause_all.storage.breakGlassConfig.untrackFarmIsPaused
        await farm_factory.save()

    except BaseException as e:
         await save_error_report(e)

