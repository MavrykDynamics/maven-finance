
from dipdup.models import Transaction
from mavryk.types.delegation.parameter.redelegate_satellite import RedelegateSatelliteParameter
from dipdup.context import HandlerContext
from mavryk.types.delegation.storage import DelegationStorage

async def on_delegation_redelegate_satellite(
    ctx: HandlerContext,
    redelegate_satellite: Transaction[RedelegateSatelliteParameter, DelegationStorage],
) -> None:
    ...