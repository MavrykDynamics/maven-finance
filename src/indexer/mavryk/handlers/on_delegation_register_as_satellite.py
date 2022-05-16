
from dipdup.context import HandlerContext
from mavryk.types.delegation.storage import DelegationStorage
from dipdup.models import Transaction
from mavryk.types.delegation.parameter.register_as_satellite import RegisterAsSatelliteParameter

async def on_delegation_register_as_satellite(
    ctx: HandlerContext,
    register_as_satellite: Transaction[RegisterAsSatelliteParameter, DelegationStorage],
) -> None:
    ...