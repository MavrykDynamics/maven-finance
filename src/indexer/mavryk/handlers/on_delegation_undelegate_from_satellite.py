
from dipdup.models import Transaction
from mavryk.types.delegation.parameter.undelegate_from_satellite_complete import UndelegateFromSatelliteCompleteParameter
from dipdup.context import HandlerContext
from mavryk.types.delegation.storage import DelegationStorage

async def on_delegation_undelegate_from_satellite(
    ctx: HandlerContext,
    undelegate_from_satellite_complete: Transaction[UndelegateFromSatelliteCompleteParameter, DelegationStorage],
) -> None:
    ...