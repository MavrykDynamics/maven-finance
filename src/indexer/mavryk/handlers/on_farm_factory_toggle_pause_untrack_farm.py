
from dipdup.context import HandlerContext
from mavryk.types.farm_factory.storage import FarmFactoryStorage
from mavryk.types.farm_factory.parameter.toggle_pause_untrack_farm import TogglePauseUntrackFarmParameter
from dipdup.models import Transaction
import mavryk.models as models

async def on_farm_factory_toggle_pause_untrack_farm(
    ctx: HandlerContext,
    toggle_pause_untrack_farm: Transaction[TogglePauseUntrackFarmParameter, FarmFactoryStorage],
) -> None:
    # Get farm contract
    farmFactoryAddress = toggle_pause_untrack_farm.data.target_address
    farmFactory = await models.FarmFactory.get(address=farmFactoryAddress)

    # Update farm factory
    farmFactory.create_farm_paused = toggle_pause_untrack_farm.data.storage['breakGlassConfig']['createFarmIsPaused']
    farmFactory.track_farm_paused = toggle_pause_untrack_farm.data.storage['breakGlassConfig']['trackFarmIsPaused']
    farmFactory.untrack_farm_paused = toggle_pause_untrack_farm.data.storage['breakGlassConfig']['untrackFarmIsPaused']
    await farmFactory.save()