
from dipdup.models import Transaction
from mavryk.types.delegation.parameter.delegate_to_satellite_complete import DelegateToSatelliteCompleteParameter
from dipdup.context import HandlerContext
from mavryk.types.delegation.storage import DelegationStorage

async def on_delegation_delegate_to_satellite_complete(
    ctx: HandlerContext,
    delegate_to_satellite_complete: Transaction[DelegateToSatelliteCompleteParameter, DelegationStorage],
) -> None:
    ...