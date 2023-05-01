from mavryk.utils.error_reporting import save_error_report

from dipdup.models import Transaction
from mavryk.types.delegation.parameter.update_satellite_record import UpdateSatelliteRecordParameter
from dipdup.context import HandlerContext
from mavryk.types.delegation.storage import DelegationStorage
import mavryk.models as models

async def on_delegation_update_satellite_record(
    ctx: HandlerContext,
    update_satellite_record: Transaction[UpdateSatelliteRecordParameter, DelegationStorage],
) -> None:

    try:
        # Get operation values
        delegation_address      = update_satellite_record.data.target_address
        satellite_address       = update_satellite_record.data.sender_address
        peer_id                 = update_satellite_record.parameter.oraclePeerId
        public_key              = update_satellite_record.parameter.oraclePublicKey
        name                    = update_satellite_record.parameter.name
        description             = update_satellite_record.parameter.description
        image                   = update_satellite_record.parameter.image
        website                 = update_satellite_record.parameter.website
        fee                     = int(update_satellite_record.parameter.satelliteFee)
        rewards_record          = update_satellite_record.storage.satelliteRewardsLedger[satellite_address]
    
        # Create and/or update record
        user                    = await models.mavryk_user_cache.get(address=satellite_address)
        delegation = await models.Delegation.get(
            address = delegation_address
        )
        satellite_record, _ = await models.Satellite.get_or_create(
            user        = user,
            delegation  = delegation
        )
        satellite_record.public_key                      = public_key
        satellite_record.peer_id                         = peer_id
        satellite_record.fee                             = fee
        satellite_record.name                            = name
        satellite_record.description                     = description
        satellite_record.image                           = image
        satellite_record.website                         = website
    
        satellite_reward_record, _ = await models.SatelliteRewards.get_or_create(
            user        = user,
            delegation  = delegation
        )
        satellite_reward_record.unpaid                                        = float(rewards_record.unpaid)
        satellite_reward_record.paid                                          = float(rewards_record.paid)
        satellite_reward_record.participation_rewards_per_share               = float(rewards_record.participationRewardsPerShare)
        satellite_reward_record.satellite_accumulated_reward_per_share        = float(rewards_record.satelliteAccumulatedRewardsPerShare)
    
        await user.save()
        await satellite_record.save()
        await satellite_reward_record.save()

    except BaseException as e:
         await save_error_report(e)

