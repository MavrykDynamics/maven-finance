
from dipdup.context import HandlerContext
from mavryk.utils.actions import persist_break_glass_action
from mavryk.types.break_glass.storage import BreakGlassStorage
from dipdup.models import Transaction
from mavryk.types.break_glass.parameter.add_council_member import AddCouncilMemberParameter

async def on_break_glass_add_council_member(
    ctx: HandlerContext,
    add_council_member: Transaction[AddCouncilMemberParameter, BreakGlassStorage],
) -> None:
    await persist_break_glass_action(add_council_member)

