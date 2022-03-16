
from dipdup.context import HandlerContext
from mavryk.types.break_glass.parameter.sign_action import SignActionParameter
from mavryk.types.break_glass.storage import BreakGlassStorage
from dipdup.models import Transaction

async def on_break_glass_sign_action(
    ctx: HandlerContext,
    sign_action: Transaction[SignActionParameter, BreakGlassStorage],
) -> None:
    ...