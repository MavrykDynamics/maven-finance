
from mavryk.types.farm_factory.parameter.untrack_farm import UntrackFarmParameter
from dipdup.context import HandlerContext
from mavryk.types.farm_factory.storage import FarmFactoryStorage
from dipdup.models import Transaction

async def on_farm_factory_untrack_farm(
    ctx: HandlerContext,
    untrack_farm: Transaction[UntrackFarmParameter, FarmFactoryStorage],
) -> None:
    ...