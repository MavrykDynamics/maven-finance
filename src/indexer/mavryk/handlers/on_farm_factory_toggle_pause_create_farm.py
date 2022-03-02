
from dipdup.context import HandlerContext
from mavryk.types.farm_factory.storage import FarmFactoryStorage
from dipdup.models import Transaction
from mavryk.types.farm_factory.parameter.toggle_pause_create_farm import TogglePauseCreateFarmParameter

async def on_farm_factory_toggle_pause_create_farm(
    ctx: HandlerContext,
    toggle_pause_create_farm: Transaction[TogglePauseCreateFarmParameter, FarmFactoryStorage],
) -> None:
    ...