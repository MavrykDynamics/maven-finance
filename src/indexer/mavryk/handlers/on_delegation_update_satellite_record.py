
from mavryk.types.delegation.parameter.update_satellite_record import UpdateSatelliteRecordParameter
from dipdup.models import Transaction
from dipdup.context import HandlerContext
from mavryk.types.delegation.storage import DelegationStorage
import mavryk.models as models

async def on_delegation_update_satellite_record(
    ctx: HandlerContext,
    update_satellite_record: Transaction[UpdateSatelliteRecordParameter, DelegationStorage],
) -> None:
    # Get operation values
    satelliteAddress               = update_satellite_record.data.sender_address
    newSatelliteName               = update_satellite_record.parameter.string_0
    newSatelliteDescription        = update_satellite_record.parameter.string_1
    newSatelliteImage              = update_satellite_record.parameter.string_2
    newSatelliteFee                = int(update_satellite_record.parameter.nat)

    # Update satellite record
    user        = await models.MavrykUser.get(
        address = satelliteAddress
    )
    satellite   = await models.SatelliteRecord.get(
        user    = user
    )
    satellite.name              = newSatelliteName
    satellite.description       = newSatelliteDescription
    satellite.image             = newSatelliteImage
    satellite.fee               = newSatelliteFee

    await satellite.save()