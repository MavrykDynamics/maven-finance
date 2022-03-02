
from dipdup.context import HandlerContext
from mavryk.types.farm_factory.storage import FarmFactoryStorage
from mavryk.types.farm_factory.parameter.toggle_pause_untrack_farm import TogglePauseUntrackFarmParameter
from dipdup.models import Transaction

async def on_farm_factory_toggle_pause_untrack_farm(
    ctx: HandlerContext,
    toggle_pause_untrack_farm: Transaction[TogglePauseUntrackFarmParameter, FarmFactoryStorage],
) -> None:
    ...