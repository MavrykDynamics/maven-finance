from mavryk.utils.error_reporting import save_error_report

from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.farm.storage import FarmStorage
from mavryk.types.farm.parameter.withdraw import WithdrawParameter
import mavryk.models as models

async def on_farm_withdraw(
    ctx: HandlerContext,
    withdraw: Transaction[WithdrawParameter, FarmStorage],
) -> None:

    try:
        # Get operation info
        farm_address                    = withdraw.data.target_address
        depositor_address               = withdraw.data.sender_address
        depositor_storage               = withdraw.storage.depositorLedger[depositor_address]
        balance                         = int(depositor_storage.balance)
        participation_rewards_per_share      = float(depositor_storage.participationRewardsPerShare )
        claimed_rewards                 = float(depositor_storage.claimedRewards)
        unclaimed_rewards               = float(depositor_storage.unclaimedRewards)
        lp_token_balance                = int(withdraw.storage.config.lpToken.tokenBalance)
        last_block_update               = int(withdraw.storage.lastBlockUpdate)
        open                            = withdraw.storage.open
        accumulated_rewards_per_share   = float(withdraw.storage.accumulatedRewardsPerShare)
        unpaid_rewards                  = float(withdraw.storage.claimedRewards.unpaid)
        paid_rewards                    = float(withdraw.storage.claimedRewards.paid)
        total_rewards                   = float(withdraw.storage.config.plannedRewards.totalRewards)
        current_reward_per_block        = float(withdraw.storage.config.plannedRewards.currentRewardPerBlock)
        total_blocks                    = int(withdraw.storage.config.plannedRewards.totalBlocks)
        min_block_time_snapshot         = int(withdraw.storage.minBlockTimeSnapshot)
    
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

