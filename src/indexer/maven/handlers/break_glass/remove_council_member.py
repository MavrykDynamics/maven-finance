from maven.utils.error_reporting import save_error_report

from dipdup.context import HandlerContext
from maven.utils.persisters import persist_break_glass_action
from maven.types.break_glass.tezos_parameters.remove_council_member import RemoveCouncilMemberParameter
from maven.types.break_glass.tezos_storage import BreakGlassStorage
from dipdup.models.tezos_tzkt import TzktTransaction

async def remove_council_member(
    ctx: HandlerContext,
    remove_council_member: TzktTransaction[RemoveCouncilMemberParameter, BreakGlassStorage],
) -> None:

    try:
        await persist_break_glass_action(ctx, remove_council_member)
    except BaseException as e:
        await save_error_report(e)

