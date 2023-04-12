
from dipdup.context import HandlerContext
from mavryk.types.farm_factory.parameter.pause_all import PauseAllParameter
from mavryk.types.farm_factory.storage import FarmFactoryStorage
from dipdup.models import Transaction
import mavryk.models as models

async def on_farm_factory_pause_all(
    ctx: HandlerContext,
    pause_all: Transaction[PauseAllParameter, FarmFactoryStorage],
) -> None:

    # Get operation info
    farm_factory_address    = pause_all.data.target_address
    farm_factory            = await models.FarmFactory.get(address=farm_factory_address)

    # Update record
    farm_factory.create_farm_paused         = pause_all.storage.breakGlassConfig.createFarmIsPaused
    farm_factory.create_farm_m_token_paused = pause_all.storage.breakGlassConfig.createFarmMTokenIsPaused
    farm_factory.track_farm_paused          = pause_all.storage.breakGlassConfig.trackFarmIsPaused
    farm_factory.untrack_farm_paused        = pause_all.storage.breakGlassConfig.untrackFarmIsPaused
    await farm_factory.save()
