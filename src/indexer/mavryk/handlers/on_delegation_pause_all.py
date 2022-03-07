
from dipdup.models import Transaction
from dipdup.context import HandlerContext
from mavryk.types.delegation.storage import DelegationStorage
from mavryk.types.delegation.parameter.pause_all import PauseAllParameter

async def on_delegation_pause_all(
    ctx: HandlerContext,
    pause_all: Transaction[PauseAllParameter, DelegationStorage],
) -> None:
    ...