
from mavryk.types.farm.parameter.close_farm import CloseFarmParameter
from dipdup.context import HandlerContext
from mavryk.types.farm.storage import FarmStorage
from dipdup.models import Transaction
import mavryk.models as models

async def on_farm_close_farm(
    ctx: HandlerContext,
    close_farm: Transaction[CloseFarmParameter, FarmStorage],
) -> None:
    # Get operation data
    farmAddress = close_farm.data.target_address
    farmAccumulated = float(close_farm.storage.accumulatedMVKPerShare)
    farmLastBlock = int(close_farm.storage.lastBlockUpdate)
    farmOpen = close_farm.storage.open
    
    # Update values
    farm = await models.Farm.get(
        address = farmAddress
    )
    farm.accumulated_mvk_per_share = farmAccumulated
    farm.last_block_update = farmLastBlock
    farm.open = farmOpen
    await farm.save()
