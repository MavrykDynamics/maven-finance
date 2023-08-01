
from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.utils.error_reporting import save_error_report
from mavryk.utils.persisters import persist_break_glass_action
from mavryk.types.break_glass.parameter.council_action_change_member import CouncilActionChangeMemberParameter
from mavryk.types.break_glass.storage import BreakGlassStorage


async def on_break_glass_council_action_change_member(
    ctx: HandlerContext,
    council_action_change_member: Transaction[CouncilActionChangeMemberParameter, BreakGlassStorage],
) -> None:

    try:
        await persist_break_glass_action(ctx, council_action_change_member)

    except BaseException as e:
         await save_error_report(e)
