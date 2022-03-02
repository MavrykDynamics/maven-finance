
from dipdup.models import Origination
from dipdup.context import HandlerContext
from mavryk.types.farm.storage import FarmStorage

async def on_farm_origination(
    ctx: HandlerContext,
    farm_origination: Origination[FarmStorage],
) -> None:
    ...