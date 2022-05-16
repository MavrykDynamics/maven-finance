
from mavryk.types.farm.parameter.update_blocks_per_minute import UpdateBlocksPerMinuteParameter
from dipdup.context import HandlerContext
from mavryk.types.farm.storage import FarmStorage
from dipdup.models import Transaction

async def on_farm_update_blocks_per_minute(
    ctx: HandlerContext,
    update_blocks_per_minute: Transaction[UpdateBlocksPerMinuteParameter, FarmStorage],
) -> None:
    ...