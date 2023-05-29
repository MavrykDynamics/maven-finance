from mavryk.utils.error_reporting import save_error_report

from dipdup.models import Transaction
from dipdup.context import HandlerContext
from mavryk.types.delegation.parameter.register_as_satellite import RegisterAsSatelliteParameter
from mavryk.types.delegation.storage import DelegationStorage
from dateutil import parser
import mavryk.models as models

async def on_delegation_register_as_satellite(
    ctx: HandlerContext,
    register_as_satellite: Transaction[RegisterAsSatelliteParameter, DelegationStorage],
) -> None:

    try:
        # Get operation values
        delegation_address      = register_as_satellite.data.target_address
        satellite_address       = register_as_satellite.data.sender_address
        peer_id                 = register_as_satellite.parameter.oraclePeerId
        public_key              = register_as_satellite.parameter.oraclePublicKey
        name                    = register_as_satellite.parameter.name
        description             = register_as_satellite.parameter.description
        image                   = register_as_satellite.parameter.image
        website                 = register_as_satellite.parameter.website
        fee                     = int(register_as_satellite.parameter.satelliteFee)
        rewards_record          = register_as_satellite.storage.satelliteRewardsLedger[satellite_address]
        satellite_storage       = register_as_satellite.storage.satelliteLedger[satellite_address]
        registration_timestamp  = parser.parse(satellite_storage.registeredDateTime)
    
        # Create and/or update record
        user                    = await models.mavryk_user_cache.get(network=ctx.datasource.network, address=satellite_address)
        delegation = await models.Delegation.get(
            network = ctx.datasource.network,
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
        satellite_record.registration_timestamp          = registration_timestamp
        satellite_record.currently_registered            = True
    
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
    
        satellite_reward_record.reference                                     = satellite_reward_record
        await satellite_reward_record.save()

    except BaseException as e:
         await save_error_report(e)

