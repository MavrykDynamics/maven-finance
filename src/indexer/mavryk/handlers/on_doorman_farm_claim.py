from mavryk.utils.error_reporting import save_error_report

from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.doorman.storage import DoormanStorage
from mavryk.types.doorman.parameter.farm_claim import FarmClaimParameter
import mavryk.models as models

async def on_doorman_farm_claim(
    ctx: HandlerContext,
    farm_claim: Transaction[FarmClaimParameter, DoormanStorage],
) -> None:

    try:    
        # Get operation info
        doorman_address                 = farm_claim.data.target_address
        sender_address                  = farm_claim.parameter.address
        sender_stake_balance_ledger     = farm_claim.storage.userStakeBalanceLedger[sender_address]
        smvk_balance                    = float(sender_stake_balance_ledger.balance)
        total_exit_fee_rewards_claimed  = float(sender_stake_balance_ledger.totalExitFeeRewardsClaimed)
        total_satellite_rewards_claimed = float(sender_stake_balance_ledger.totalSatelliteRewardsClaimed)
        total_farm_rewards_claimed      = float(sender_stake_balance_ledger.totalFarmRewardsClaimed)
        participation_fees_per_share    = float(sender_stake_balance_ledger.participationFeesPerShare)
        timestamp                       = farm_claim.data.timestamp
        doorman                         = await models.Doorman.get(network=ctx.datasource.network, address=doorman_address)
        unclaimed_rewards               = float(farm_claim.storage.unclaimedRewards)
        accumulated_fees_per_share      = float(farm_claim.storage.accumulatedFeesPerShare)
    
        # Get or create the interacting user
        user                = await models.mavryk_user_cache.get(network=ctx.datasource.network, address=sender_address)
        amount                          = smvk_balance - user.smvk_balance
        user.smvk_balance               = smvk_balance
        await user.save()
        
        stake_account, _    = await models.DoormanStakeAccount.get_or_create(
            user    = user,
            doorman = doorman
        )
        stake_account.participation_fees_per_share      = participation_fees_per_share
        stake_account.total_exit_fee_rewards_claimed    = total_exit_fee_rewards_claimed
        stake_account.total_satellite_rewards_claimed   = total_satellite_rewards_claimed
        stake_account.total_farm_rewards_claimed        = total_farm_rewards_claimed
        stake_account.smvk_balance                      = smvk_balance
        await stake_account.save()
    
        # Create a stake record
        stake_record = models.StakeHistoryData(
            timestamp           = timestamp,
            type                = models.StakeType.FARM_CLAIM,
            desired_amount      = amount,
            final_amount        = amount,
            doorman             = doorman,
            from_               = user
        )
        await stake_record.save()
    
        # Update doorman contract
        doorman.unclaimed_rewards           = unclaimed_rewards
        doorman.accumulated_fees_per_share  = accumulated_fees_per_share
        await doorman.save()
    except BaseException as e:
         await save_error_report(e)

