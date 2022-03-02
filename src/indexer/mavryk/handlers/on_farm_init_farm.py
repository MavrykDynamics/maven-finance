
from mavryk.types.farm.parameter.init_farm import InitFarmParameter
from dipdup.context import HandlerContext
from mavryk.types.farm.storage import FarmStorage
from dipdup.models import Transaction

async def on_farm_init_farm(
    ctx: HandlerContext,
    init_farm: Transaction[InitFarmParameter, FarmStorage],
) -> None:
    ...