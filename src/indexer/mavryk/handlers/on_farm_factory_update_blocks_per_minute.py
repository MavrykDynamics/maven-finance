
from mavryk.types.farm_factory.storage import FarmFactoryStorage
from mavryk.types.farm_factory.parameter.update_blocks_per_minute import UpdateBlocksPerMinuteParameter
from dipdup.context import HandlerContext
from dipdup.models import Transaction
import mavryk.models as models

async def on_farm_factory_update_blocks_per_minute(
    ctx: HandlerContext,
    update_blocks_per_minute: Transaction[UpdateBlocksPerMinuteParameter, FarmFactoryStorage],
) -> None:

    # Get operation info
    farm_factory_address            = update_blocks_per_minute.data.target_address
    blocks_per_minute               = int(update_blocks_per_minute.parameter.__root__)

    # Update record
    farm_factory                    = await models.FarmFactory.get(address  = farm_factory_address)
    farm_factory.blocks_per_minute  = blocks_per_minute
    await farm_factory.save()
