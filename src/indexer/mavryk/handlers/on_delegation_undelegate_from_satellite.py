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
        satellite_storage           = undelegate_from_satellite.storage.satelliteLedger[satellite_address]
        total_delegated_amount      = float(satellite_storage.totalDelegatedAmount)
    
        # Create and/or update record
        user                                                            = await models.mavryk_user_cache.get(network=ctx.datasource.network, address=user_address)
        satellite                                                       = await models.mavryk_user_cache.get(network=ctx.datasource.network, address=satellite_address)
        delegation                                                      = await models.Delegation.get(
            network = ctx.datasource.network,
            address = delegation_address
        )
        satellite_record                                                = await models.Satellite.get(
            user        = satellite,
            delegation  = delegation
        )
        satellite_record.total_delegated_amount                         = total_delegated_amount
        await satellite_record.save()
        satellite_reward_record, _                                      = await models.SatelliteRewards.get_or_create(
            user        = user,
            delegation  = delegation
        )
        satellite_reward_record.unpaid                                  = float(rewards_record.unpaid)
        satellite_reward_record.paid                                    = float(rewards_record.paid)
        satellite_reward_record.participation_rewards_per_share         = float(rewards_record.participationRewardsPerShare)
        satellite_reward_record.satellite_accumulated_reward_per_share  = float(rewards_record.satelliteAccumulatedRewardsPerShare)
        delegation_record_exists                                        = await models.DelegationRecord.filter(
            user        = user,
            delegation  = delegation,
            satellite   = satellite_record
        ).exists()

        if delegation_record_exists:
            await user.save()
            await models.DelegationRecord.filter(
                user        = user,
                delegation  = delegation,
                satellite   = satellite_record
            ).delete()
            await satellite_reward_record.save()

    except BaseException as e:
         await save_error_report(e)

