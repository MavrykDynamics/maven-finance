from mavryk.utils.error_reporting import save_error_report

from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.utils.persisters import persist_break_glass_action
from mavryk.types.break_glass.parameter.propagate_break_glass import PropagateBreakGlassParameter
from mavryk.types.break_glass.storage import BreakGlassStorage

async def propagate_break_glass(
    ctx: HandlerContext,
    propagate_break_glass: Transaction[PropagateBreakGlassParameter, BreakGlassStorage],
) -> None:

    try:    
        await persist_break_glass_action(ctx, propagate_break_glass)
    except BaseException as e:
        await save_error_report(e)

