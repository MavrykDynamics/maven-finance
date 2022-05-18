
from dipdup.context import HandlerContext
from mavryk.utils.persisters import persist_break_glass_action
from mavryk.types.break_glass.storage import BreakGlassStorage
from dipdup.models import Transaction
from mavryk.types.break_glass.parameter.change_council_member import ChangeCouncilMemberParameter

async def on_break_glass_change_council_member(
    ctx: HandlerContext,
    change_council_member: Transaction[ChangeCouncilMemberParameter, BreakGlassStorage],
) -> None:
    await persist_break_glass_action(change_council_member)