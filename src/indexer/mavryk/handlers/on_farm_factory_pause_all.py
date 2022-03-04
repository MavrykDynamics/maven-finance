
from dipdup.context import HandlerContext
from mavryk.types.farm_factory.parameter.pause_all import PauseAllParameter
from mavryk.types.farm_factory.storage import FarmFactoryStorage
from dipdup.models import Transaction
import mavryk.models as models

async def on_farm_factory_pause_all(
    ctx: HandlerContext,
    pause_all: Transaction[PauseAllParameter, FarmFactoryStorage],
) -> None:
    # Get farm contract
    farmFactoryAddress = pause_all.data.target_address
    farmFactory = await models.FarmFactory.get(address=farmFactoryAddress)

    # Update farm factory
    farmFactory.create_farm_paused = pause_all.data.storage['breakGlassConfig']['createFarmIsPaused']
    farmFactory.track_farm_paused = pause_all.data.storage['breakGlassConfig']['trackFarmIsPaused']
    farmFactory.untrack_farm_paused = pause_all.data.storage['breakGlassConfig']['untrackFarmIsPaused']
    await farmFactory.save()