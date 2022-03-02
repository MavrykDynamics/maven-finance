
from dipdup.context import HandlerContext
from mavryk.types.farm.parameter.pause_all import PauseAllParameter
from mavryk.types.farm.storage import FarmStorage
from dipdup.models import Transaction

async def on_farm_pause_all(
    ctx: HandlerContext,
    pause_all: Transaction[PauseAllParameter, FarmStorage],
) -> None:
    ...