
from dipdup.context import HandlerContext
from mavryk.types.farm.parameter.unpause_all import UnpauseAllParameter
from mavryk.types.farm.storage import FarmStorage
from dipdup.models import Transaction

async def on_farm_unpause_all(
    ctx: HandlerContext,
    unpause_all: Transaction[UnpauseAllParameter, FarmStorage],
) -> None:
    ...