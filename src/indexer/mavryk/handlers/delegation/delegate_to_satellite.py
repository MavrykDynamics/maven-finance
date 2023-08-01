from mavryk.utils.error_reporting import save_error_report

from dipdup.models import Transaction
from dipdup.context import HandlerContext
from mavryk.types.delegation.parameter.delegate_to_satellite import DelegateToSatelliteParameter
from mavryk.types.delegation.storage import DelegationStorage
from dateutil import parser
import mavryk.models as models

async def delegate_to_satellite(
    ctx: HandlerContext,
    delegate_to_satellite: Transaction[DelegateToSatelliteParameter, DelegationStorage],
) -> None:

    try:
        # Get operation values
        delegation_address      = delegate_to_satellite.data.target_address
        satellite_address       = delegate_to_satellite.parameter.satelliteAddress
        user_address            = delegate_to_satellite.parameter.userAddress
    
        # If the user_address is not in the storage, it means this operation is a redelegation
        # Only the second internal call to the %delegateToSatellite entrypoint will have an impact on the storage
        if user_address in delegate_to_satellite.storage.delegateLedger:
            rewards_record          = delegate_to_satellite.storage.satelliteRewardsLedger[user_address]
            delegate_storage        = delegate_to_satellite.storage.delegateLedger[user_address]
            satellite_storage       = delegate_to_satellite.storage.satelliteLedger[satellite_address]
            total_delegated_amount  = float(satellite_storage.totalDelegatedAmount)
    
            # Create and/or update record
            user                                                                = await models.mavryk_user_cache.get(network=ctx.datasource.network, address=user_address)
            satellite                                                           = await models.mavryk_user_cache.get(network=ctx.datasource.network, address=satellite_address)
            delegation                                                          = await models.Delegation.get(
                network     = ctx.datasource.network,
                address     = delegation_address
            )
            satellite_record                                                    = await models.Satellite.get(
                user        = satellite,
                delegation  = delegation
            )
            satellite_record.total_delegated_amount                             = total_delegated_amount
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
            satellite_reward_record.reference_governance_cycle_id               = int(rewards_record.referenceGovernanceCycleId)
            satellite_reward_record.tracked                                     = rewards_record.tracked
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

    except BaseException as e:
        await save_error_report(e)

