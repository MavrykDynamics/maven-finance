from mavryk.utils.error_reporting import save_error_report

from dipdup.context import HandlerContext
from mavryk.types.farm.storage import FarmStorage
from mavryk.types.farm.parameter.claim import ClaimParameter
from dipdup.models import Transaction
import mavryk.models as models

async def on_farm_claim(
    ctx: HandlerContext,
    claim: Transaction[ClaimParameter, FarmStorage],
) -> None:

    try:
        # Get operation info
        farm_address                    = claim.data.target_address
        depositor_address               = claim.data.sender_address
        depositor_storage               = claim.storage.depositorLedger[depositor_address]
        balance                         = int(depositor_storage.balance)
        participation_rewards_per_share = float(depositor_storage.participationRewardsPerShare )
        claimed_rewards                 = float(depositor_storage.claimedRewards)
        unclaimed_rewards               = float(depositor_storage.unclaimedRewards)
        lp_token_balance                = int(claim.storage.config.lpToken.tokenBalance)
        last_block_update               = int(claim.storage.lastBlockUpdate)
        open                            = claim.storage.open
        accumulated_rewards_per_share   = float(claim.storage.accumulatedRewardsPerShare)
        unpaid_rewards                  = float(claim.storage.claimedRewards.unpaid)
        paid_rewards                    = float(claim.storage.claimedRewards.paid)
        total_rewards                   = float(claim.storage.config.plannedRewards.totalRewards)
        current_reward_per_block        = float(claim.storage.config.plannedRewards.currentRewardPerBlock)
        total_blocks                    = int(claim.storage.config.plannedRewards.totalBlocks)
        min_block_time_snapshot         = int(claim.storage.minBlockTimeSnapshot)
        
        # Create and update records
        farm                            = await models.Farm.get(
            address = farm_address
        )
        farm.total_rewards              = total_rewards
        farm.current_reward_per_block   = current_reward_per_block
        farm.total_blocks               = total_blocks
        farm.min_block_time_snapshot    = min_block_time_snapshot
        farm.lp_token_balance           = lp_token_balance
        farm.accumulated_mvk_per_share  = accumulated_rewards_per_share
        farm.last_block_update          = last_block_update
        farm.open                       = open
        farm.unpaid_rewards             = unpaid_rewards
        farm.paid_rewards               = paid_rewards
        await farm.save()
    
        user                            = await models.mavryk_user_cache.get(address=depositor_address)
    
        farm_account, _                 = await models.FarmAccount.get_or_create(
            user = user,
            farm = farm
        )
        farm_account.deposited_amount               = balance
        farm_account.participation_rewards_per_share     = participation_rewards_per_share 
        farm_account.unclaimed_rewards              = unclaimed_rewards
        farm_account.claimed_rewards                = claimed_rewards
        await farm_account.save()

    except BaseException as e:
         await save_error_report(e)

