
from dipdup.context import HandlerContext
from mavryk.types.farm_factory.storage import FarmFactoryStorage
from dipdup.models import Transaction
from mavryk.types.farm_factory.parameter.toggle_pause_create_farm import TogglePauseCreateFarmParameter
import mavryk.models as models

async def on_farm_factory_toggle_pause_create_farm(
    ctx: HandlerContext,
    toggle_pause_create_farm: Transaction[TogglePauseCreateFarmParameter, FarmFactoryStorage],
) -> None:

    # Get operation info
    farm_factory_address    = toggle_pause_create_farm.data.target_address
    farm_factory            = await models.FarmFactory.get(address=farm_factory_address)

    # Update record
    farm_factory.create_farm_paused     = toggle_pause_create_farm.storage.breakGlassConfig.createFarmIsPaused
    farm_factory.track_farm_paused      = toggle_pause_create_farm.storage.breakGlassConfig.trackFarmIsPaused
    farm_factory.untrack_farm_paused    = toggle_pause_create_farm.storage.breakGlassConfig.untrackFarmIsPaused
    await farm_factory.save()
