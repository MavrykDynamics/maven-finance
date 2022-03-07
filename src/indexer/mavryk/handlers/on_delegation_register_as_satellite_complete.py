
from mavryk.types.delegation.parameter.register_as_satellite_complete import RegisterAsSatelliteCompleteParameter
from dipdup.models import Transaction
from dipdup.context import HandlerContext
from mavryk.types.delegation.storage import DelegationStorage

async def on_delegation_register_as_satellite_complete(
    ctx: HandlerContext,
    register_as_satellite_complete: Transaction[RegisterAsSatelliteCompleteParameter, DelegationStorage],
) -> None:
    ...