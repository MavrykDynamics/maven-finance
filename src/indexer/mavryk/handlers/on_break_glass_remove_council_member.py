
from dipdup.context import HandlerContext
from mavryk.utils.actions import persist_break_glass_action
from mavryk.types.break_glass.parameter.remove_council_member import RemoveCouncilMemberParameter
from mavryk.types.break_glass.storage import BreakGlassStorage
from dipdup.models import Transaction

async def on_break_glass_remove_council_member(
    ctx: HandlerContext,
    remove_council_member: Transaction[RemoveCouncilMemberParameter, BreakGlassStorage],
) -> None:
    await persist_break_glass_action(remove_council_member)