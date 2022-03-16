
from dipdup.models import Origination
from dipdup.context import HandlerContext
from mavryk.types.break_glass.storage import BreakGlassStorage

async def on_break_glass_origination(
    ctx: HandlerContext,
    break_glass_origination: Origination[BreakGlassStorage],
) -> None:
    breakpoint()