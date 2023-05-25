from mavryk.utils.error_reporting import save_error_report

from mavryk.types.farm.parameter.close_farm import CloseFarmParameter
from dipdup.context import HandlerContext
from mavryk.types.farm.storage import FarmStorage
from dipdup.models import Transaction
import mavryk.models as models

async def on_farm_close_farm(
    ctx: HandlerContext,
    close_farm: Transaction[CloseFarmParameter, FarmStorage],
) -> None:

    try:
        # Get operation info
        farm_address                    = close_farm.data.target_address
        last_block_update               = int(close_farm.storage.lastBlockUpdate)
        open                            = close_farm.storage.open
        accumulated_rewards_per_share   = float(close_farm.storage.accumulatedRewardsPerShare)
        unpaid_rewards                  = float(close_farm.storage.claimedRewards.unpaid)
        total_rewards                   = float(close_farm.storage.config.plannedRewards.totalRewards)
        current_reward_per_block        = float(close_farm.storage.config.plannedRewards.currentRewardPerBlock)
        total_blocks                    = int(close_farm.storage.config.plannedRewards.totalBlocks)
        min_block_time_snapshot         = int(close_farm.storage.minBlockTimeSnapshot)
    
        # Update record
        farm                                = await models.Farm.get(network=ctx.datasource.network, address= farm_address)
        farm.last_block_update              = last_block_update
        farm.open                           = open
        farm.accumulated_rewards_per_share  = accumulated_rewards_per_share
        farm.unpaid_rewards                 = unpaid_rewards
        farm.total_rewards                  = total_rewards
        farm.current_reward_per_block       = current_reward_per_block
        farm.total_blocks                   = total_blocks
        farm.min_block_time_snapshot        = min_block_time_snapshot
        await farm.save()
    except BaseException as e:
         await save_error_report(e)

