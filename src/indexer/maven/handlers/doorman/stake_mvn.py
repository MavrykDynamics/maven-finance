from maven.utils.error_reporting import save_error_report

from maven.types.mvn_token.tezos_parameters.transfer import TransferParameter
from dipdup.models.tezos import TezosTransaction
from maven.types.doorman.tezos_parameters.stake_mvn import StakeMvnParameter
from dipdup.context import HandlerContext
from maven.types.doorman.tezos_storage import DoormanStorage
from maven.types.mvn_token.tezos_storage import MvnTokenStorage
import maven.models as models

async def stake_mvn(
    ctx: HandlerContext,
    stake_mvn: TezosTransaction[StakeMvnParameter, DoormanStorage],
    transfer: TezosTransaction[TransferParameter, MvnTokenStorage],
) -> None:

    try:
        # Get operation info
        doorman_address                     = stake_mvn.data.target_address
        sender_address                      = stake_mvn.data.sender_address
        sender_stake_balance_ledger         = stake_mvn.storage.userStakeBalanceLedger[sender_address]
        smvn_balance                        = float(sender_stake_balance_ledger.balance)
        mvn_balance                         = float(transfer.storage.ledger[sender_address])
        total_exit_fee_rewards_claimed      = float(sender_stake_balance_ledger.totalExitFeeRewardsClaimed)
        total_satellite_rewards_claimed     = float(sender_stake_balance_ledger.totalSatelliteRewardsClaimed)
        total_farm_rewards_claimed          = float(sender_stake_balance_ledger.totalFarmRewardsClaimed)
        participation_fees_per_share        = float(sender_stake_balance_ledger.participationFeesPerShare)
        timestamp                           = stake_mvn.data.timestamp
        amount                              = float(stake_mvn.parameter.root)
        doorman                             = await models.Doorman.get(network='atlasnet', address=doorman_address)
        unclaimed_rewards                   = float(stake_mvn.storage.unclaimedRewards)
        accumulated_fees_per_share          = float(stake_mvn.storage.accumulatedFeesPerShare)
    
        # Get or create the interacting user
        user                = await models.maven_user_cache.get(network='atlasnet', address=sender_address)
        user.mvn_balance    = mvn_balance
        user.smvn_balance   = smvn_balance
        await user.save()
        
        stake_account, _    = await models.DoormanStakeAccount.get_or_create(
            user    = user,
            doorman = doorman
        )
        stake_account.participation_fees_per_share      = participation_fees_per_share
        stake_account.total_exit_fee_rewards_claimed    = total_exit_fee_rewards_claimed
        stake_account.total_satellite_rewards_claimed   = total_satellite_rewards_claimed
        stake_account.total_farm_rewards_claimed        = total_farm_rewards_claimed
        stake_account.smvn_balance                      = smvn_balance
        await stake_account.save()
    
        # Create a stake_mvn record
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

