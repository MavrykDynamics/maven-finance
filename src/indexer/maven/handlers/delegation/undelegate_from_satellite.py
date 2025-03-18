from maven.utils.error_reporting import save_error_report

from dipdup.models.tezos import TezosTransaction
from dipdup.context import HandlerContext
from maven.types.delegation.tezos_parameters.undelegate_from_satellite import UndelegateFromSatelliteParameter
from maven.types.delegation.tezos_storage import DelegationStorage
from maven import models as models

async def undelegate_from_satellite(
    ctx: HandlerContext,
    undelegate_from_satellite: TezosTransaction[UndelegateFromSatelliteParameter, DelegationStorage],
) -> None:

    try:
        # Get operation values
        delegation_address          = undelegate_from_satellite.data.target_address
        user_address                = undelegate_from_satellite.parameter.root
        satellite_addresses         = undelegate_from_satellite.storage.satelliteLedger

        for satellite_address in satellite_addresses:
            # Get total delegated amount
            satellite_storage           = undelegate_from_satellite.storage.satelliteLedger[satellite_address]
            total_delegated_amount      = float(satellite_storage.totalDelegatedAmount)
        
            # Create and/or update record
            user                                                            = await models.maven_user_cache.get(network='atlasnet', address=user_address)
            satellite                                                       = await models.maven_user_cache.get(network='atlasnet', address=satellite_address)
            delegation                                                      = await models.Delegation.get(
                network = 'atlasnet',
                address = delegation_address
            )
            satellite_record                                                = await models.Satellite.get(
                user        = satellite,
                delegation  = delegation
            )
            satellite_record.total_delegated_amount                         = total_delegated_amount
            await satellite_record.save()
            delegation_record_exists                                        = await models.DelegationRecord.filter(
                user        = user,
                delegation  = delegation,
                satellite   = satellite_record
            ).exists()

            # Update the rewards record
            if user_address in undelegate_from_satellite.storage.satelliteRewardsLedger:
                rewards_record              = undelegate_from_satellite.storage.satelliteRewardsLedger[user_address]
                satellite_address           = rewards_record.satelliteReferenceAddress
                satellite_reward_record, _                                      = await models.SatelliteRewards.get_or_create(
                    user        = user,
                    delegation  = delegation
                )
                satellite_reward_record.unpaid                                  = float(rewards_record.unpaid)
                satellite_reward_record.paid                                    = float(rewards_record.paid)
                satellite_reward_record.participation_rewards_per_share         = float(rewards_record.participationRewardsPerShare)
                satellite_reward_record.satellite_accumulated_reward_per_share  = float(rewards_record.satelliteAccumulatedRewardsPerShare)
                await satellite_reward_record.save()

            if delegation_record_exists:
                await user.save()
                await models.DelegationRecord.filter(
                    user        = user,
                    delegation  = delegation,
                    satellite   = satellite_record
                ).delete()

    except BaseException as e:
        await save_error_report(e)

