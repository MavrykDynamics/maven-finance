
from dipdup.models import Transaction
from mavryk.types.delegation.parameter.unregister_as_satellite import UnregisterAsSatelliteParameter
from dipdup.context import HandlerContext
from mavryk.types.delegation.storage import DelegationStorage

async def on_delegation_unregister_as_satellite(
    ctx: HandlerContext,
    unregister_as_satellite: Transaction[UnregisterAsSatelliteParameter, DelegationStorage],
) -> None:
    ...