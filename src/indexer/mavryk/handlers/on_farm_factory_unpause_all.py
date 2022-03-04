
from mavryk.types.farm_factory.storage import FarmFactoryStorage
from dipdup.context import HandlerContext
from mavryk.types.farm_factory.parameter.unpause_all import UnpauseAllParameter
from dipdup.models import Transaction
import mavryk.models as models

async def on_farm_factory_unpause_all(
    ctx: HandlerContext,
    unpause_all: Transaction[UnpauseAllParameter, FarmFactoryStorage],
) -> None:
    # Get farm contract
    farmFactoryAddress = unpause_all.data.target_address
    farmFactory = await models.FarmFactory.get(address=farmFactoryAddress)

    # Update farm factory
    farmFactory.create_farm_paused = unpause_all.data.storage['breakGlassConfig']['createFarmIsPaused']
    farmFactory.track_farm_paused = unpause_all.data.storage['breakGlassConfig']['trackFarmIsPaused']
    farmFactory.untrack_farm_paused = unpause_all.data.storage['breakGlassConfig']['untrackFarmIsPaused']
    await farmFactory.save()