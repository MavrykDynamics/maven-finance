from mavryk.utils.error_reporting import save_error_report

from dipdup.models import Transaction
from mavryk.types.delegation.parameter.unregister_as_satellite import UnregisterAsSatelliteParameter
from dipdup.context import HandlerContext
from mavryk.types.delegation.storage import DelegationStorage
import mavryk.models as models

async def on_delegation_unregister_as_satellite(
    ctx: HandlerContext,
    unregister_as_satellite: Transaction[UnregisterAsSatelliteParameter, DelegationStorage],
) -> None:

    try:
        # Get operation values
        delegation_address      = unregister_as_satellite.data.target_address
        satellite_address       = unregister_as_satellite.data.sender_address
        rewards_record          = unregister_as_satellite.storage.satelliteRewardsLedger[satellite_address]
    
        # Delete records
        user                    = await models.mavryk_user_cache.get(address=satellite_address)
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
    
        satelliteRecord                                                     = await models.Satellite.filter(
            delegation  = delegation,
            user        = user
        ).first()
        await user.save()
    
        satelliteRecord.currently_registered    = False
        await satelliteRecord.save()

    except BaseException:
         await save_error_report()

