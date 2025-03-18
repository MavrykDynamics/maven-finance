from maven.utils.error_reporting import save_error_report

from maven.types.delegation.tezos_storage import DelegationStorage
from maven.types.delegation.tezos_parameters.distribute_reward import DistributeRewardParameter
from dipdup.context import HandlerContext
from dipdup.models.tezos import TezosTransaction
from maven import models as models

async def distribute_reward(
    ctx: HandlerContext,
    distribute_reward: TezosTransaction[DistributeRewardParameter, DelegationStorage],
) -> None:

    try:
        # Get operation info
        delegation_address      = distribute_reward.data.target_address
        elligible_satellites    = distribute_reward.parameter.eligibleSatellites
        timestamp               = distribute_reward.data.timestamp
        reward_amount           = float(distribute_reward.parameter.totalStakedMvnReward)
    
        # Get and update records
        delegation  = await models.Delegation.get(network='atlasnet', address= delegation_address)
        for satellite_address in elligible_satellites:
            user                    = await models.maven_user_cache.get(network='atlasnet', address=satellite_address)
            rewards_record          = distribute_reward.storage.satelliteRewardsLedger[satellite_address]
            satellite_rewards, _    = await models.SatelliteRewards.get_or_create(
                user        = user,
                delegation  = delegation
            )
            satellite_rewards.unpaid                                    = float(rewards_record.unpaid)
            satellite_rewards.paid                                      = float(rewards_record.paid)
            satellite_rewards.participation_rewards_per_share           = float(rewards_record.participationRewardsPerShare)
            satellite_rewards.satellite_accumulated_reward_per_share    = float(rewards_record.satelliteAccumulatedRewardsPerShare)
            satellite_rewards.reference_governance_cycle_id             = int(rewards_record.referenceGovernanceCycleId)
            satellite_rewards.tracked                                   = rewards_record.tracked
            await satellite_rewards.save()
    
        # Create a stakeMvn record
        doorman         = await models.Doorman.get(
            network     = 'atlasnet'
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

