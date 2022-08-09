
from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.utils.persisters import persist_break_glass_action
from mavryk.types.break_glass.parameter.propagate_break_glass import PropagateBreakGlassParameter
from mavryk.types.break_glass.storage import BreakGlassStorage

async def on_break_glass_propagate_break_glass(
    ctx: HandlerContext,
    propagate_break_glass: Transaction[PropagateBreakGlassParameter, BreakGlassStorage],
) -> None:
    
    await persist_break_glass_action(propagate_break_glass)