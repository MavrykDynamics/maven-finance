from mavryk.utils.error_reporting import save_error_report

from dipdup.models.tezos_tzkt import TzktTransaction
from mavryk.types.delegation.tezos_parameters.unregister_as_satellite import UnregisterAsSatelliteParameter
from dipdup.context import HandlerContext
from mavryk.types.delegation.tezos_storage import DelegationStorage
import mavryk.models as models

async def unregister_as_satellite(
    ctx: HandlerContext,
    unregister_as_satellite: TzktTransaction[UnregisterAsSatelliteParameter, DelegationStorage],
) -> None:

    try:
        # Get operation values
        delegation_address          = unregister_as_satellite.data.target_address
        satellite_address           = unregister_as_satellite.data.sender_address
        rewards_record              = unregister_as_satellite.storage.satelliteRewardsLedger[satellite_address]
    
        # Delete records
        user                        = await models.mavryk_user_cache.get(network=ctx.datasource.name.replace('tzkt_',''), address=satellite_address)
        delegation = await models.Delegation.get(
            network = ctx.datasource.name.replace('tzkt_',''),
            address = delegation_address
        )
        satellite_reward_record, _ = await models.SatelliteRewards.get_or_create(
            user        = user,
            delegation  = delegation
        )
        satellite_reward_record.unpaid                                  = float(rewards_record.unpaid)
        satellite_reward_record.paid                                    = float(rewards_record.paid)
        satellite_reward_record.participation_rewards_per_share         = float(rewards_record.participationRewardsPerShare)
        satellite_reward_record.satellite_accumulated_reward_per_share  = float(rewards_record.satelliteAccumulatedRewardsPerShare)
        satellite_reward_record.reference_governance_cycle_id           = int(rewards_record.referenceGovernanceCycleId)
        satellite_reward_record.tracked                                 = rewards_record.tracked
        await models.Satellite.filter(
            delegation  = delegation,
            user        = user
        ).update(
            currently_registered    = False
        )

    except BaseException as e:
        await save_error_report(e)

