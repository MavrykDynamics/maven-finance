from mavryk.utils.error_reporting import save_error_report

from mavryk.types.mvk_token.parameter.transfer import TransferParameter
from dipdup.models import Transaction
from mavryk.types.doorman.parameter.stake import StakeParameter
from dipdup.context import HandlerContext
from mavryk.types.doorman.storage import DoormanStorage
from mavryk.types.mvk_token.storage import MvkTokenStorage
import mavryk.models as models

async def on_doorman_stake(
    ctx: HandlerContext,
    stake: Transaction[StakeParameter, DoormanStorage],
    transfer: Transaction[TransferParameter, MvkTokenStorage],
) -> None:

    try:
        # Get operation info
        doorman_address                     = stake.data.target_address
        sender_address                      = stake.data.sender_address
        sender_stake_balance_ledger         = stake.storage.userStakeBalanceLedger[sender_address]
        smvk_balance                        = float(sender_stake_balance_ledger.balance)
        mvk_balance                         = float(transfer.storage.ledger[sender_address])
        total_exit_fee_rewards_claimed      = float(sender_stake_balance_ledger.totalExitFeeRewardsClaimed)
        total_satellite_rewards_claimed     = float(sender_stake_balance_ledger.totalSatelliteRewardsClaimed)
        total_farm_rewards_claimed          = float(sender_stake_balance_ledger.totalFarmRewardsClaimed)
        participation_fees_per_share        = float(sender_stake_balance_ledger.participationFeesPerShare)
        timestamp                           = stake.data.timestamp
        amount                              = float(stake.parameter.__root__)
        doorman                             = await models.Doorman.get(address=doorman_address)
        unclaimed_rewards                   = float(stake.storage.unclaimedRewards)
        accumulated_fees_per_share          = float(stake.storage.accumulatedFeesPerShare)
    
        # Get or create the interacting user
        user                = await models.mavryk_user_cache.get(address=sender_address)
        user.mvk_balance    = mvk_balance
        user.smvk_balance   = smvk_balance
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
            type                = models.StakeType.STAKE,
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

