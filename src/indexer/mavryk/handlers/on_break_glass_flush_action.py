
from dipdup.context import HandlerContext
from mavryk.utils.persisters import persist_break_glass_action
from mavryk.types.break_glass.storage import BreakGlassStorage
from dipdup.models import Transaction
from mavryk.types.break_glass.parameter.flush_action import FlushActionParameter

async def on_break_glass_flush_action(
    ctx: HandlerContext,
    flush_action: Transaction[FlushActionParameter, BreakGlassStorage],
) -> None:

    await persist_break_glass_action(flush_action)