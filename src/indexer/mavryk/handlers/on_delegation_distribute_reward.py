from mavryk.utils.error_reporting import save_error_report

from mavryk.types.delegation.storage import DelegationStorage
from mavryk.types.delegation.parameter.distribute_reward import DistributeRewardParameter
from dipdup.context import HandlerContext
from dipdup.models import Transaction
import mavryk.models as models

async def on_delegation_distribute_reward(
    ctx: HandlerContext,
    distribute_reward: Transaction[DistributeRewardParameter, DelegationStorage],
) -> None:

    try:
        # Get operation info
        delegation_address      = distribute_reward.data.target_address
        elligible_satellites    = distribute_reward.parameter.eligibleSatellites
        timestamp               = distribute_reward.data.timestamp
        reward_amount           = float(distribute_reward.parameter.totalStakedMvkReward)
    
        # Get and update records
        delegation  = await models.Delegation.get(network=ctx.datasource.network, address= delegation_address)
        for satellite_address in elligible_satellites:
            user                    = await models.mavryk_user_cache.get(network=ctx.datasource.network, address=satellite_address)
            rewards_record          = distribute_reward.storage.satelliteRewardsLedger[satellite_address]
            satellite_rewards, _    = await models.SatelliteRewards.get_or_create(
                user        = user,
                delegation  = delegation
            )
            satellite_rewards.unpaid                                    = float(rewards_record.unpaid)
            satellite_rewards.paid                                      = float(rewards_record.paid)
            satellite_rewards.participation_rewards_per_share           = float(rewards_record.participationRewardsPerShare)
            satellite_rewards.satellite_accumulated_reward_per_share    = float(rewards_record.satelliteAccumulatedRewardsPerShare)
            await satellite_rewards.save()
    
        # Create a stake record
        doorman         = await models.Doorman.get(
            network     = ctx.datasource.network
        )
        stake_record    = models.StakeHistoryData(
            timestamp           = timestamp,
            type                = models.StakeType.SATELLITE_REWARD,
            desired_amount      = reward_amount,
            final_amount        = reward_amount,
            doorman             = doorman,
            from_               = user
        )
        await stake_record.save()
    except BaseException as e:
         await save_error_report(e)

