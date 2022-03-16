
from dipdup.context import HandlerContext
from mavryk.utils.actions import persist_break_glass_action
from mavryk.types.break_glass.parameter.remove_break_glass_control import RemoveBreakGlassControlParameter
from mavryk.types.break_glass.storage import BreakGlassStorage
from dipdup.models import Transaction

async def on_break_glass_remove_break_glass_control(
    ctx: HandlerContext,
    remove_break_glass_control: Transaction[RemoveBreakGlassControlParameter, BreakGlassStorage],
) -> None:
    await persist_break_glass_action(remove_break_glass_control)