from maven.utils.error_reporting import save_error_report

from maven.types.doorman.tezos_parameters.compound import CompoundParameter
from dipdup.context import HandlerContext
from dipdup.models.tezos import TezosTransaction
from maven.types.doorman.tezos_storage import DoormanStorage
from maven import models as models

async def compound(
    ctx: HandlerContext,
    compound: TezosTransaction[CompoundParameter, DoormanStorage],
) -> None:

    try:
        # Get operation info
        doorman_address                 = compound.data.target_address
        user_addresses                  = compound.parameter.root
        doorman                         = await models.Doorman.get(network='atlasnet', address=doorman_address)

        for user_address in user_addresses:
            sender_stake_balance_ledger     = compound.storage.userStakeBalanceLedger[user_address]
            smvn_balance                    = float(sender_stake_balance_ledger.balance)
            total_exit_fee_rewards_claimed  = float(sender_stake_balance_ledger.totalExitFeeRewardsClaimed)
            total_satellite_rewards_claimed = float(sender_stake_balance_ledger.totalSatelliteRewardsClaimed)
            total_farm_rewards_claimed      = float(sender_stake_balance_ledger.totalFarmRewardsClaimed)
            participation_fees_per_share    = float(sender_stake_balance_ledger.participationFeesPerShare)
            timestamp                       = compound.data.timestamp
            unclaimed_rewards               = float(compound.storage.unclaimedRewards)
            accumulated_fees_per_share      = float(compound.storage.accumulatedFeesPerShare)
        
            # Get or create the interacting user
            user                            = await models.maven_user_cache.get(network='atlasnet', address=user_address)
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
            
            # Get doorman info
            doorman_user        = await models.maven_user_cache.get(network='atlasnet', address=doorman_address)
            smvn_total_supply   = doorman_user.mvn_balance
            smvn_users          = await models.MavenUser.filter(smvn_balance__gt=0).count()
            avg_smvn_per_user   = float(smvn_total_supply) / float(smvn_users)
            await doorman_user.save()
        
            # Create a stakeMvn record
            stake_record = models.StakeHistoryData(
                timestamp           = timestamp,
                type                = models.StakeType.COMPOUND,
                desired_amount      = amount,
                final_amount        = amount,
                doorman             = doorman,
                from_               = user,
                smvn_total_supply   = smvn_total_supply,
                avg_smvn_per_user   = avg_smvn_per_user
            )
            await stake_record.save()
        
            # Update doorman contract
            doorman.unclaimed_rewards           = unclaimed_rewards
            doorman.accumulated_fees_per_share  = accumulated_fees_per_share
            await doorman.save()

    except BaseException as e:
        await save_error_report(e)

