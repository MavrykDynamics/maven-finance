from maven.utils.error_reporting import save_error_report
from dipdup.context import HandlerContext
from dipdup.models.tezos import TezosTransaction
from maven.types.m_farm.tezos_parameters.close_farm import CloseFarmParameter
from maven.types.m_farm.tezos_storage import MFarmStorage
from maven import models as models

async def close_farm(
    ctx: HandlerContext,
    close_farm: TezosTransaction[CloseFarmParameter, MFarmStorage],
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
        await models.Farm.filter(network='atlasnet', address= farm_address).update(
            last_block_update              = last_block_update,
            open                           = open,
            accumulated_rewards_per_share  = accumulated_rewards_per_share,
            unpaid_rewards                 = unpaid_rewards,
            total_rewards                  = total_rewards,
            current_reward_per_block       = current_reward_per_block,
            total_blocks                   = total_blocks,
            min_block_time_snapshot        = min_block_time_snapshot
        )

    except BaseException as e:
        await save_error_report(e)

