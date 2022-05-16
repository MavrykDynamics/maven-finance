
from mavryk.types.break_glass.parameter.set_admin import SetAdminParameter
from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.break_glass.storage import BreakGlassStorage

async def on_break_glass_set_admin(
    ctx: HandlerContext,
    set_admin: Transaction[SetAdminParameter, BreakGlassStorage],
) -> None:
    ...