
from dipdup.models import Transaction
from dipdup.context import HandlerContext
from mavryk.types.delegation.parameter.delegate_to_satellite import DelegateToSatelliteParameter
from mavryk.types.delegation.storage import DelegationStorage
import mavryk.models as models

async def on_delegation_delegate_to_satellite(
    ctx: HandlerContext,
    delegate_to_satellite: Transaction[DelegateToSatelliteParameter, DelegationStorage],
) -> None:

    # Get operation values
    delegation_address      = delegate_to_satellite.data.target_address
    satellite_address       = delegate_to_satellite.parameter.satelliteAddress
    user_address            = delegate_to_satellite.parameter.userAddress
    rewards_record          = delegate_to_satellite.storage.satelliteRewardsLedger[user_address]

    # Create and/or update record
    user, _ = await models.MavrykUser.get_or_create(
        address = user_address
    )
    satellite, _ = await models.MavrykUser.get_or_create(
        address = satellite_address
    )
    delegation = await models.Delegation.get(
        address = delegation_address
    )
    satelliteRecord, _ = await models.SatelliteRecord.get_or_create(
        user        = satellite_address,
        delegation  = delegation
    )
    satelliteRewardReferenceRecord, _ = await models.SatelliteRewardsRecord.get_or_create(
        user        = satellite,
        delegation  = delegation
    )
    satelliteRewardRecord, _ = await models.SatelliteRewardsRecord.get_or_create(
        user        = user,
        delegation  = delegation
    )
    satelliteRewardRecord.reference                                     = satelliteRewardReferenceRecord
    satelliteRewardRecord.unpaid                                        = float(rewards_record.unpaid)
    satelliteRewardRecord.paid                                          = float(rewards_record.paid)
    satelliteRewardRecord.participation_rewards_per_share               = float(rewards_record.participationRewardsPerShare)
    satelliteRewardRecord.satellite_accumulated_reward_per_share        = float(rewards_record.satelliteAccumulatedRewardsPerShare)
    delegationRecord, _ = await models.DelegationRecord.get_or_create(
        user        = user,
        delegation  = delegation
    )
    delegationRecord.satellite_record = satelliteRecord
    await user.save()
    await satellite.save()
    await delegationRecord.save()
    await satelliteRecord.save()
    await satelliteRewardRecord.save()
    await satelliteRewardReferenceRecord.save()
