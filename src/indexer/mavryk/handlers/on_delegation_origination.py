
from dipdup.models import Origination
from dipdup.context import HandlerContext
from mavryk.types.delegation.storage import DelegationStorage

async def on_delegation_origination(
    ctx: HandlerContext,
    delegation_origination: Origination[DelegationStorage],
) -> None:
    ...