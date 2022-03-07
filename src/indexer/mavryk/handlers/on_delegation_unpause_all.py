
from dipdup.models import Transaction
from dipdup.context import HandlerContext
from mavryk.types.delegation.parameter.unpause_all import UnpauseAllParameter
from mavryk.types.delegation.storage import DelegationStorage

async def on_delegation_unpause_all(
    ctx: HandlerContext,
    unpause_all: Transaction[UnpauseAllParameter, DelegationStorage],
) -> None:
    ...