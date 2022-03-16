
from dipdup.context import HandlerContext
from mavryk.types.break_glass.storage import BreakGlassStorage
from dipdup.models import Transaction
from mavryk.types.break_glass.parameter.add_council_member import AddCouncilMemberParameter

async def on_break_glass_add_council_member(
    ctx: HandlerContext,
    add_council_member: Transaction[AddCouncilMemberParameter, BreakGlassStorage],
) -> None:
    breakpoint()