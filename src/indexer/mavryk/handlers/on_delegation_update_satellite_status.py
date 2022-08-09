
from dipdup.models import Transaction
from mavryk.types.delegation.parameter.update_satellite_status import UpdateSatelliteStatusParameter
from dipdup.context import HandlerContext
from mavryk.types.delegation.storage import DelegationStorage
import mavryk.models as models

async def on_delegation_update_satellite_status(
    ctx: HandlerContext,
    update_satellite_status: Transaction[UpdateSatelliteStatusParameter, DelegationStorage],
) -> None:

    # Get operation info
    delegation_address  = update_satellite_status.data.target_address
    satellite_address   = update_satellite_status.parameter.satelliteAddress
    new_status          = update_satellite_status.parameter.newStatus
    status_type         = models.SatelliteStatus.ACTIVE
    if new_status == "SUSPENDED":
        status_type = models.SatelliteStatus.SUSPENDED
    elif new_status == "BANNED":
        status_type = models.SatelliteStatus.BANNED

    # Create or update record
    delegation          = await models.Delegation.get(address   = delegation_address)
    user, _             = await models.MavrykUser.get_or_create(
        address = satellite_address
    )
    await user.save()
    satellite           = await models.SatelliteRecord.get(
        delegation  = delegation,
        user        = user
    )
    satellite.status    = status_type
    await satellite.save()
