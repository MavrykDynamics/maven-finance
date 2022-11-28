
from dipdup.models import Transaction
from dipdup.context import HandlerContext
from mavryk.types.delegation.parameter.register_as_satellite import RegisterAsSatelliteParameter
from mavryk.types.delegation.storage import DelegationStorage
import mavryk.models as models

async def on_delegation_register_as_satellite(
    ctx: HandlerContext,
    register_as_satellite: Transaction[RegisterAsSatelliteParameter, DelegationStorage],
) -> None:

    # TODO: implement PeerId/PublicKey when deployed
    # breakpoint()

    # Get operation values
    delegation_address      = register_as_satellite.data.target_address
    satellite_address       = register_as_satellite.data.sender_address
    name                    = register_as_satellite.parameter.name
    description             = register_as_satellite.parameter.description
    image                   = register_as_satellite.parameter.image
    website                 = register_as_satellite.parameter.website
    fee                     = int(register_as_satellite.parameter.satelliteFee)
    rewards_record          = register_as_satellite.storage.satelliteRewardsLedger[satellite_address]

    # Create and/or update record
    user                    = await models.mavryk_user_cache.get(address=satellite_address)
    delegation = await models.Delegation.get(
        address = delegation_address
    )
    satelliteRecord, _ = await models.Satellite.get_or_create(
        user        = user,
        delegation  = delegation
    )
    satelliteRecord.fee                             = fee
    satelliteRecord.name                            = name
    satelliteRecord.description                     = description
    satelliteRecord.image                           = image
    satelliteRecord.website                         = website
    satelliteRecord.currently_registered            = True

    satelliteRewardRecord, _ = await models.SatelliteRewards.get_or_create(
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

    satelliteRewardRecord.reference                                     = satelliteRewardRecord
    await satelliteRewardRecord.save()
