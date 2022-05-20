
from dipdup.models import Transaction
from mavryk.types.delegation.parameter.unregister_as_satellite import UnregisterAsSatelliteParameter
from dipdup.context import HandlerContext
from mavryk.types.delegation.storage import DelegationStorage
import mavryk.models as models

async def on_delegation_unregister_as_satellite(
    ctx: HandlerContext,
    unregister_as_satellite: Transaction[UnregisterAsSatelliteParameter, DelegationStorage],
) -> None:
    ...
    # # Get operation values
    # satelliteAddress    = unregister_as_satellite.data.sender_address

    # # Delete records
    # user = await models.MavrykUser.get(
    #     address = satelliteAddress
    # )
    # satelliteRecord = await models.SatelliteRecord.get(
    #     user = user
    # )
    # satelliteRecord.active  = False
    # await satelliteRecord.save()
    # await satelliteRecord.delete()
