
from dipdup.context import HandlerContext
from mavryk.types.break_glass.storage import BreakGlassStorage
from dipdup.models import Transaction
from mavryk.types.break_glass.parameter.break_glass import BreakGlassParameter

async def on_break_glass_break_glass(
    ctx: HandlerContext,
    break_glass: Transaction[BreakGlassParameter, BreakGlassStorage],
) -> None:
    ...