
from mavryk.types.farm_factory.parameter.toggle_pause_track_farm import TogglePauseTrackFarmParameter
from dipdup.context import HandlerContext
from mavryk.types.farm_factory.storage import FarmFactoryStorage
from dipdup.models import Transaction

async def on_farm_factory_toggle_pause_track_farm(
    ctx: HandlerContext,
    toggle_pause_track_farm: Transaction[TogglePauseTrackFarmParameter, FarmFactoryStorage],
) -> None:
    ...