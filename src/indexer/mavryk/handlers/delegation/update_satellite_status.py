from mavryk.utils.error_reporting import save_error_report

from dipdup.models.tezos_tzkt import TzktTransaction
from mavryk.types.delegation.tezos_parameters.update_satellite_status import UpdateSatelliteStatusParameter
from dipdup.context import HandlerContext
from mavryk.types.delegation.tezos_storage import DelegationStorage
import mavryk.models as models

async def update_satellite_status(
    ctx: HandlerContext,
    update_satellite_status: TzktTransaction[UpdateSatelliteStatusParameter, DelegationStorage],
) -> None:

    try:
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
        delegation          = await models.Delegation.get(network=ctx.datasource.name.replace('tzkt_',''), address= delegation_address)
        user                = await models.mavryk_user_cache.get(network=ctx.datasource.name.replace('tzkt_',''), address=satellite_address)
        await models.Satellite.filter(
            delegation  = delegation,
            user        = user
        ).update(
            status      = status_type
        )

    except BaseException as e:
        await save_error_report(e)

