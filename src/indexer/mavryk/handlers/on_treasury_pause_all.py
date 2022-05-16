
from dipdup.context import HandlerContext
from mavryk.types.treasury.parameter.pause_all import PauseAllParameter
from dipdup.models import Transaction
from mavryk.types.treasury.storage import TreasuryStorage

async def on_treasury_pause_all(
    ctx: HandlerContext,
    pause_all: Transaction[PauseAllParameter, TreasuryStorage],
) -> None:
    ...