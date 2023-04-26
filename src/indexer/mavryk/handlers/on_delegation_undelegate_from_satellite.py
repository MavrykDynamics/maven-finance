from mavryk.utils.error_reporting import save_error_report

from dipdup.models import Transaction
from dipdup.context import HandlerContext
from mavryk.types.delegation.parameter.undelegate_from_satellite import UndelegateFromSatelliteParameter
from mavryk.types.delegation.storage import DelegationStorage
import mavryk.models as models

async def on_delegation_undelegate_from_satellite(
    ctx: HandlerContext,
    undelegate_from_satellite: Transaction[UndelegateFromSatelliteParameter, DelegationStorage],
) -> None:

    try:
        # Get operation values
        delegation_address          = undelegate_from_satellite.data.target_address
        user_address                = undelegate_from_satellite.parameter.__root__
        rewards_record              = undelegate_from_satellite.storage.satelliteRewardsLedger[user_address]
        satellite_address           = rewards_record.satelliteReferenceAddress
    
        # Create and/or update record
        user                                                            = await models.mavryk_user_cache.get(address=user_address)
        satellite                                                       = await models.mavryk_user_cache.get(address=satellite_address)
        delegation                                                      = await models.Delegation.get(
            address = delegation_address
        )
        satellite_record                                                = await models.Satellite.filter(
            user        = satellite,
            delegation  = delegation
        ).first()
        satellite_reward_record, _                                      = await models.SatelliteRewards.get_or_create(
            user        = user,
            delegation  = delegation
        )
        satellite_reward_record.unpaid                                  = float(rewards_record.unpaid)
        satellite_reward_record.paid                                    = float(rewards_record.paid)
        satellite_reward_record.participation_rewards_per_share         = float(rewards_record.participationRewardsPerShare)
        satellite_reward_record.satellite_accumulated_reward_per_share  = float(rewards_record.satelliteAccumulatedRewardsPerShare)
        delegation_record                                               = await models.DelegationRecord.filter(
            user        = user,
            delegation  = delegation,
            satellite   = satellite_record
        ).first()
        # TODO: remove this temp fix
        if delegation_record:
            await user.save()
            await delegation_record.delete()
            await satellite_reward_record.save()

    except BaseException:
         await save_error_report()

