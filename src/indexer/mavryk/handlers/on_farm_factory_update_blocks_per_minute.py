
from mavryk.types.farm_factory.storage import FarmFactoryStorage
from mavryk.types.farm_factory.parameter.update_blocks_per_minute import UpdateBlocksPerMinuteParameter
from dipdup.context import HandlerContext
from dipdup.models import Transaction

async def on_farm_factory_update_blocks_per_minute(
    ctx: HandlerContext,
    update_blocks_per_minute: Transaction[UpdateBlocksPerMinuteParameter, FarmFactoryStorage],
) -> None:
    ...