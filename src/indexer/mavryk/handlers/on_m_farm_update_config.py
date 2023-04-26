from mavryk.utils.error_reporting import save_error_report
from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.m_farm.parameter.update_config import UpdateConfigParameter
from mavryk.types.m_farm.storage import MFarmStorage
import mavryk.models as models

async def on_m_farm_update_config(
    ctx: HandlerContext,
    update_config: Transaction[UpdateConfigParameter, MFarmStorage],
) -> None:

    try:
        # Get operation values
        farm_address                    = update_config.data.target_address
        force_rewards_from_transfer     = update_config.storage.config.forceRewardFromTransfer
        last_block_update               = int(update_config.storage.lastBlockUpdate)
        open                            = update_config.storage.open
        accumulated_rewards_per_share   = float(update_config.storage.accumulatedRewardsPerShare)
        unpaid_rewards                  = float(update_config.storage.claimedRewards.unpaid)
        current_reward_per_block        = float(update_config.storage.config.plannedRewards.currentRewardPerBlock)
        total_rewards                   = float(update_config.storage.config.plannedRewards.totalRewards)
        total_blocks                    = int(update_config.storage.config.plannedRewards.totalBlocks)
        min_block_time_snapshot         = int(update_config.storage.minBlockTimeSnapshot)
        timestamp                       = update_config.data.timestamp
    
        # Update contract
        farm = await models.Farm.get(
            address = farm_address
        )
        farm.last_updated_at                = timestamp
        farm.force_rewards_from_transfer    = force_rewards_from_transfer
        farm.last_block_update              = last_block_update
        farm.open                           = open
        farm.accumulated_rewards_per_share  = accumulated_rewards_per_share
        farm.unpaid_rewards                 = unpaid_rewards
        farm.current_reward_per_block       = current_reward_per_block
        farm.total_rewards                  = total_rewards
        farm.min_block_time_snapshot        = min_block_time_snapshot
        farm.total_blocks                   = total_blocks
        await farm.save()

    except BaseException:
         await save_error_report()

