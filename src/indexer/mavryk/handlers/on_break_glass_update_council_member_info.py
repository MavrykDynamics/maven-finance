
from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.break_glass.parameter.update_council_member_info import UpdateCouncilMemberInfoParameter
from mavryk.types.break_glass.storage import BreakGlassStorage

async def on_break_glass_update_council_member_info(
    ctx: HandlerContext,
    update_council_member_info: Transaction[UpdateCouncilMemberInfoParameter, BreakGlassStorage],
) -> None:
    ...