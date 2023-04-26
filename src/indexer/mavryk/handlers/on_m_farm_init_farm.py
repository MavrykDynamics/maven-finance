from mavryk.utils.error_reporting import save_error_report
from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.m_farm.parameter.init_farm import InitFarmParameter
from mavryk.types.m_farm.storage import MFarmStorage
import mavryk.models as models

async def on_m_farm_init_farm(
    ctx: HandlerContext,
    init_farm: Transaction[InitFarmParameter, MFarmStorage],
) -> None:

    try:
        # Get operation info
        farm_address                    = init_farm.data.target_address
        admin                           = init_farm.storage.admin
        governance_address              = init_farm.storage.governanceAddress
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
    
        # Create record
        governance      = await models.Governance.get(
            address = governance_address
        )
        farm, _         = await models.Farm.get_or_create(
            address     = farm_address,
            admin       = admin,
            governance  = governance
        )
        farm.force_rewards_from_transfer     = force_rewards_from_transfer
        farm.infinite                        = infinite
        farm.total_blocks                    = total_blocks
        farm.current_reward_per_block        = current_reward_per_block
        farm.total_rewards                   = total_rewards
        farm.deposit_paused                  = deposit_paused
        farm.withdraw_paused                 = withdraw_paused
        farm.claim_paused                    = claim_paused
        farm.last_block_update               = last_block_update
        farm.open                            = open
        farm.init                            = init
        farm.init_block                      = init_block
        farm.accumulated_rewards_per_share   = accumulated_rewards_per_share
        farm.unpaid_rewards                  = unpaid_rewards
        farm.paid_rewards                    = paid_rewards
        farm.min_block_time_snapshot        = min_block_time_snapshot
        await farm.save()

    except BaseException:
         await save_error_report()

