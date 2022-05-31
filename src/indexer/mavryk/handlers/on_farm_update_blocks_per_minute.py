
from mavryk.types.farm.parameter.update_blocks_per_minute import UpdateBlocksPerMinuteParameter
from dipdup.context import HandlerContext
from mavryk.types.farm.storage import FarmStorage
from dipdup.models import Transaction
import mavryk.models as models

async def on_farm_update_blocks_per_minute(
    ctx: HandlerContext,
    update_blocks_per_minute: Transaction[UpdateBlocksPerMinuteParameter, FarmStorage],
) -> None:
    
    # Get operation info
    farm_address                    = update_blocks_per_minute.data.target_address
    last_block_update               = int(update_blocks_per_minute.storage.lastBlockUpdate)
    open                            = update_blocks_per_minute.storage.open
    accumulated_rewards_per_share   = float(update_blocks_per_minute.storage.accumulatedRewardsPerShare)
    unpaid_rewards                  = float(update_blocks_per_minute.storage.claimedRewards.unpaid)
    
    blocks_per_minute               = int(update_blocks_per_minute.parameter.__root__)
    current_reward_per_block        = int(update_blocks_per_minute.storage.config.plannedRewards.currentRewardPerBlock)
    total_blocks                    = int(update_blocks_per_minute.storage.config.plannedRewards.totalBlocks)

    # Update record
    farm                                = await models.Farm.get(address = farm_address)
    farm.last_block_update              = last_block_update
    farm.open                           = open
    farm.accumulated_rewards_per_share  = accumulated_rewards_per_share
    farm.unpaid_rewards                 = unpaid_rewards
    farm.blocks_per_minute              = blocks_per_minute
    farm.current_reward_per_block       = current_reward_per_block
    farm.total_blocks                   = total_blocks
    await farm.save()
