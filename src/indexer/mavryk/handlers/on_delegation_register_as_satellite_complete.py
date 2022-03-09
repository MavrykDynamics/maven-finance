
from mavryk.types.delegation.parameter.register_as_satellite_complete import RegisterAsSatelliteCompleteParameter
from dipdup.models import Transaction
from dipdup.context import HandlerContext
from mavryk.types.delegation.storage import DelegationStorage
import mavryk.models as models

async def on_delegation_register_as_satellite_complete(
    ctx: HandlerContext,
    register_as_satellite_complete: Transaction[RegisterAsSatelliteCompleteParameter, DelegationStorage],
) -> None:
    # Get operation values
    userAddress                         = register_as_satellite_complete.data.initiator_address
    delegationAddress                   = register_as_satellite_complete.data.target_address
    satelliteName                       = register_as_satellite_complete.parameter.string_0
    satelliteDescription                = register_as_satellite_complete.parameter.string_1
    satelliteImage                      = register_as_satellite_complete.parameter.string_2
    satelliteFee                        = int(register_as_satellite_complete.parameter.nat_0)
    satelliteRegisteredDatetime         = register_as_satellite_complete.data.timestamp
    satelliteActive                     = register_as_satellite_complete.data.diffs[0]['content']['value']['status']
    #TODO??: Balance change for MVK?

    # Create and update records
    user, _ = await models.User.get_or_create(
        address     = userAddress
    )
    delegation = await models.Delegation.get(
        address     = delegationAddress
    )
    satelliteRecord, _ = await models.SatelliteRecord.get_or_create(
        user                    = user,
        delegation              = delegation,
        registered_datetime     = satelliteRegisteredDatetime,
        unregistered_datetime   = satelliteRegisteredDatetime,
        active                  = satelliteActive,
        fee           = satelliteFee,
        name                    = satelliteName,
        description             = satelliteDescription,
        image                   = satelliteImage,
    )
    await user.save()
    await satelliteRecord.save()
