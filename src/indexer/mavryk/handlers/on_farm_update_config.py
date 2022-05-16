
from dipdup.context import HandlerContext
from mavryk.types.farm.parameter.update_config import UpdateConfigParameter
from dipdup.models import Transaction
from mavryk.types.farm.storage import FarmStorage

async def on_farm_update_config(
    ctx: HandlerContext,
    update_config: Transaction[UpdateConfigParameter, FarmStorage],
) -> None:
    ...