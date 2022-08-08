
from dipdup.models import Transaction
from mavryk.types.delegation.parameter.update_satellite_record import UpdateSatelliteRecordParameter
from dipdup.context import HandlerContext
from mavryk.types.delegation.storage import DelegationStorage
import mavryk.models as models

async def on_delegation_update_satellite_record(
    ctx: HandlerContext,
    update_satellite_record: Transaction[UpdateSatelliteRecordParameter, DelegationStorage],
) -> None:
    # Get operation values
    delegation_address      = update_satellite_record.data.target_address
    satellite_address       = update_satellite_record.data.sender_address
    name                    = update_satellite_record.parameter.name
    description             = update_satellite_record.parameter.description
    image                   = update_satellite_record.parameter.image
    website                 = update_satellite_record.parameter.website
    fee                     = int(update_satellite_record.parameter.satelliteFee)
    rewards_record          = update_satellite_record.storage.satelliteRewardsLedger[satellite_address]

    # Create and/or update record
    user, _ = await models.MavrykUser.get_or_create(
        address = satellite_address
    )
    delegation = await models.Delegation.get(
        address = delegation_address
    )
    satelliteRecord, _ = await models.SatelliteRecord.get_or_create(
        user        = user,
        delegation  = delegation
    )
    satelliteRecord.fee                             = fee
    satelliteRecord.name                            = name
    satelliteRecord.description                     = description
    satelliteRecord.image                           = image
    satelliteRecord.website                         = website

    satelliteRewardRecord, _ = await models.SatelliteRewardsRecord.get_or_create(
        user        = user,
        delegation  = delegation
    )
    satelliteRewardRecord.unpaid                                        = float(rewards_record.unpaid)
    satelliteRewardRecord.paid                                          = float(rewards_record.paid)
    satelliteRewardRecord.participation_rewards_per_share               = float(rewards_record.participationRewardsPerShare)
    satelliteRewardRecord.satellite_accumulated_reward_per_share        = float(rewards_record.satelliteAccumulatedRewardsPerShare)

    await user.save()
    await satelliteRecord.save()
    await satelliteRewardRecord.save()
