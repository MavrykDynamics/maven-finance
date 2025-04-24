from maven.utils.error_reporting import save_error_report

from dipdup.context import HandlerContext
from dipdup.models.tezos import TezosTransaction
from maven.types.doorman.tezos_storage import DoormanStorage
from maven.types.doorman.tezos_parameters.farm_claim import FarmClaimParameter
from maven import models as models

async def farm_claim(
    ctx: HandlerContext,
    farm_claim: TezosTransaction[FarmClaimParameter, DoormanStorage],
) -> None:

    try:
        # Get operation info
        doorman_address                 = farm_claim.data.target_address
        user_claim_records              = farm_claim.parameter.set
        doorman                         = await models.Doorman.get(network='atlasnet', address=doorman_address)

        # Update doorman
        unclaimed_rewards                   = float(farm_claim.storage.unclaimedRewards)
        accumulated_fees_per_share          = float(farm_claim.storage.accumulatedFeesPerShare)
        doorman.unclaimed_rewards           = unclaimed_rewards
        doorman.accumulated_fees_per_share  = accumulated_fees_per_share
        await doorman.save()

        # Update users
        for user_claim_record in user_claim_records:
            user_address                    = user_claim_record.address
            sender_stake_balance_ledger     = farm_claim.storage.userStakeBalanceLedger[user_address]
            smvn_balance                    = float(sender_stake_balance_ledger.balance)
            total_exit_fee_rewards_claimed  = float(sender_stake_balance_ledger.totalExitFeeRewardsClaimed)
            total_satellite_rewards_claimed = float(sender_stake_balance_ledger.totalSatelliteRewardsClaimed)
            total_farm_rewards_claimed      = float(sender_stake_balance_ledger.totalFarmRewardsClaimed)
            participation_fees_per_share    = float(sender_stake_balance_ledger.participationFeesPerShare)
            timestamp                       = farm_claim.data.timestamp
        
            # Get or create the interacting user
            user                = await models.get_user(network='atlasnet', address=user_address)
            amount                          = smvn_balance - user.smvn_balance
            user.smvn_balance               = smvn_balance
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
        
            # Create a stakeMvn record
            stake_record = models.StakeHistoryData(
                timestamp           = timestamp,
                type                = models.StakeType.FARM_CLAIM,
                desired_amount      = amount,
                final_amount        = amount,
                doorman             = doorman,
                from_               = user
            )
            await stake_record.save()

    except BaseException as e:
        await save_error_report(e)

