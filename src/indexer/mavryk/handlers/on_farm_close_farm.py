
from mavryk.types.farm.parameter.close_farm import CloseFarmParameter
from dipdup.context import HandlerContext
from mavryk.types.farm.storage import FarmStorage
from dipdup.models import Transaction

async def on_farm_close_farm(
    ctx: HandlerContext,
    close_farm: Transaction[CloseFarmParameter, FarmStorage],
) -> None:
    ...