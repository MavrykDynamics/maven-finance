
from mavryk.types.farm.parameter.close_farm import CloseFarmParameter
from dipdup.context import HandlerContext
from mavryk.types.farm.storage import FarmStorage
from dipdup.models import Transaction
import mavryk.models as models

async def on_farm_close_farm(
    ctx: HandlerContext,
    close_farm: Transaction[CloseFarmParameter, FarmStorage],
) -> None:

    # Get operation info
    farm_address                    = close_farm.data.target_address
    last_block_update               = int(close_farm.storage.lastBlockUpdate)
    open                            = close_farm.storage.open
    accumulated_rewards_per_share   = float(close_farm.storage.accumulatedRewardsPerShare)
    unpaid_rewards                  = float(close_farm.storage.claimedRewards.unpaid)

    # Update record
    farm                                = await models.Farm.get(address = farm_address)
    farm.last_block_update              = last_block_update
    farm.open                           = open
    farm.accumulated_rewards_per_share  = accumulated_rewards_per_share
    farm.unpaid_rewards                 = unpaid_rewards
    await farm.save()