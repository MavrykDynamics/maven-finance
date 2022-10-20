
from dipdup.models import Transaction
from dipdup.context import HandlerContext
from mavryk.types.delegation.parameter.undelegate_from_satellite import UndelegateFromSatelliteParameter
from mavryk.types.delegation.storage import DelegationStorage
import mavryk.models as models

async def on_delegation_undelegate_from_satellite(
    ctx: HandlerContext,
    undelegate_from_satellite: Transaction[UndelegateFromSatelliteParameter, DelegationStorage],
) -> None:

    # Get operation values
    delegation_address      = undelegate_from_satellite.data.target_address
    user_address            = undelegate_from_satellite.parameter.__root__
    rewards_record          = undelegate_from_satellite.storage.satelliteRewardsLedger[user_address]

    # Create and/or update record
    user, _ = await models.MavrykUser.get_or_create(
        address = user_address
    )
    delegation = await models.Delegation.get(
        address = delegation_address
    )
    satelliteRewardRecord, _ = await models.SatelliteRewards.get_or_create(
        user        = user,
        delegation  = delegation
    )
    satelliteRewardRecord.unpaid                                        = float(rewards_record.unpaid)
    satelliteRewardRecord.paid                                          = float(rewards_record.paid)
    satelliteRewardRecord.participation_rewards_per_share               = float(rewards_record.participationRewardsPerShare)
    satelliteRewardRecord.satellite_accumulated_reward_per_share        = float(rewards_record.satelliteAccumulatedRewardsPerShare)
    delegationRecord = await models.DelegationRecord.get(
        user        = user,
        delegation  = delegation
    )
    await user.save()
    await delegationRecord.delete()
    await satelliteRewardRecord.save()
