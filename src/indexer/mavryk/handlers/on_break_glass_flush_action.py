from mavryk.utils.error_reporting import save_error_report

from dipdup.context import HandlerContext
from mavryk.utils.persisters import persist_break_glass_action
from mavryk.types.break_glass.storage import BreakGlassStorage
from dipdup.models import Transaction
from mavryk.types.break_glass.parameter.flush_action import FlushActionParameter

async def on_break_glass_flush_action(
    ctx: HandlerContext,
    flush_action: Transaction[FlushActionParameter, BreakGlassStorage],
) -> None:

    try:
        await persist_break_glass_action(flush_action)
    except BaseException as e:
         await save_error_report(e)

