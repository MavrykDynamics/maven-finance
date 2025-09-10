from maven.utils.error_reporting import save_error_report

from maven.types.farm.tezos_parameters.init_farm import InitFarmParameter
from dipdup.context import HandlerContext
from maven.types.farm.tezos_storage import FarmStorage
from dipdup.models.tezos import TezosTransaction
from maven import models as models
import datetime

async def init_farm(
    ctx: HandlerContext,
    init_farm: TezosTransaction[InitFarmParameter, FarmStorage],
) -> None:

    try:
        # Get operation info
        farm_address                    = init_farm.data.target_address
        admin                           = init_farm.storage.admin
        force_rewards_from_transfer     = init_farm.storage.config.forceRewardFromTransfer
        infinite                        = init_farm.storage.config.infinite
        total_blocks                    = int(init_farm.storage.config.plannedRewards.totalBlocks)
        current_reward_per_block        = int(init_farm.storage.config.plannedRewards.currentRewardPerBlock)
        total_rewards                   = int(init_farm.storage.config.plannedRewards.totalRewards)
        deposit_paused                  = init_farm.storage.breakGlassConfig.depositIsPaused
        withdraw_paused                 = init_farm.storage.breakGlassConfig.withdrawIsPaused
        claim_paused                    = init_farm.storage.breakGlassConfig.claimIsPaused
        last_block_update               = int(init_farm.storage.lastBlockUpdate)
        open                            = init_farm.storage.open
        init                            = init_farm.storage.init
        init_block                      = int(init_farm.storage.initBlock)
        accumulated_rewards_per_share   = float(init_farm.storage.accumulatedRewardsPerShare)
        unpaid_rewards                  = float(init_farm.storage.claimedRewards.unpaid)
        paid_rewards                    = float(init_farm.storage.claimedRewards.paid)
        min_block_time_snapshot         = int(init_farm.storage.minBlockTimeSnapshot)
        start_timestamp                 = init_farm.data.timestamp
        end_timestamp                   = None
        if not infinite:
            farm_duration   = min_block_time_snapshot * total_blocks
            end_timestamp   = start_timestamp + datetime.timedelta(seconds=farm_duration)

        # Create record
        governance      = await models.Governance.get(
            network = 'atlasnet'
        )
        await models.Farm.filter(
            network                         = 'atlasnet',
            address                         = farm_address
        ).update(
            start_timestamp                 = start_timestamp,
            end_timestamp                   = end_timestamp,
            admin                           = admin,
            governance                      = governance,
            force_rewards_from_transfer     = force_rewards_from_transfer,
            infinite                        = infinite,
            total_blocks                    = total_blocks,
            current_reward_per_block        = current_reward_per_block,
            total_rewards                   = total_rewards,
            deposit_paused                  = deposit_paused,
            withdraw_paused                 = withdraw_paused,
            claim_paused                    = claim_paused,
            last_block_update               = last_block_update,
            open                            = open,
            init                            = init,
            init_block                      = init_block,
            accumulated_rewards_per_share   = accumulated_rewards_per_share,
            unpaid_rewards                  = unpaid_rewards,
            paid_rewards                    = paid_rewards,
            min_block_time_snapshot         = min_block_time_snapshot
        )

    except BaseException as e:
        await save_error_report(e)

