
from dipdup.models import Transaction
from dipdup.context import HandlerContext
from mavryk.types.delegation.parameter.delegate_to_satellite import DelegateToSatelliteParameter
from mavryk.types.delegation.storage import DelegationStorage
from dateutil import parser
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
    delegate_storage        = delegate_to_satellite.storage.delegateLedger[user_address]

    # Create and/or update record
    user                                                                = await models.mavryk_user_cache.get(address=user_address)
    satellite                                                           = await models.mavryk_user_cache.get(address=satellite_address)
    delegation                                                          = await models.Delegation.get(
        address     = delegation_address
    )
    satellite_record                                                    = await models.Satellite.filter(
        user        = satellite,
        delegation  = delegation
    ).first()
    satellite_reward_reference_record, _                                = await models.SatelliteRewards.get_or_create(
        user        = satellite,
        delegation  = delegation
    )
    satellite_reward_record, _                                          = await models.SatelliteRewards.get_or_create(
        user        = user,
        delegation  = delegation
    )
    satellite_reward_record.reference                                   = satellite_reward_reference_record
    satellite_reward_record.unpaid                                      = float(rewards_record.unpaid)
    satellite_reward_record.paid                                        = float(rewards_record.paid)
    satellite_reward_record.participation_rewards_per_share             = float(rewards_record.participationRewardsPerShare)
    satellite_reward_record.satellite_accumulated_reward_per_share      = float(rewards_record.satelliteAccumulatedRewardsPerShare)
    delegation_record, _                                                = await models.DelegationRecord.get_or_create(
        user        = user,
        delegation  = delegation,
        satellite   = satellite_record
    )
    delegation_record.satellite_registration_timestamp                  = parser.parse(delegate_storage.satelliteRegisteredDateTime)
    await user.save()
    await satellite.save()
    await satellite_record.save()
    await delegation_record.save()
    await satellite_reward_record.save()
    await satellite_reward_reference_record.save()
