
from mavryk.types.delegation.parameter.delegate_to_satellite import DelegateToSatelliteParameter
from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.delegation.storage import DelegationStorage
import mavryk.models as models

async def on_delegation_delegate_to_satellite(
    ctx: HandlerContext,
    delegate_to_satellite: Transaction[DelegateToSatelliteParameter, DelegationStorage],
) -> None:
    # Get operation values
    userAddress         = delegate_to_satellite.data.sender_address
    delegationAddress   = delegate_to_satellite.data.target_address
    satelliteAddress    = delegate_to_satellite.parameter.__root__

    # Create and/or update record
    user, _ = await models.User.get_or_create(
        address = userAddress
    )
    delegation = await models.Delegation.get(
        address = delegationAddress
    )
    satelliteRecord = await models.SatelliteRecord.get(
        user = satelliteAddress
    )
    delegationRecord = models.DelegationRecord(
        satellite_record = satelliteRecord,
        user = user,
        delegation = delegation
    )
    await user.save()
    await delegationRecord.save()