from dipdup.context import HandlerContext
from dipdup.models.tezos_tzkt import TzktTransaction
from mavryk.types.break_glass.tezos_parameters.council_action_change_member import CouncilActionChangeMemberParameter
from mavryk.types.break_glass.tezos_storage import BreakGlassStorage
from mavryk.utils.persisters import persist_break_glass_action
from mavryk.utils.error_reporting import save_error_report

async def council_action_change_member(
    ctx: HandlerContext,
    council_action_change_member: TzktTransaction[CouncilActionChangeMemberParameter, BreakGlassStorage],
) -> None:

    try:
        await persist_break_glass_action(ctx, council_action_change_member)

    except BaseException as e:
         await save_error_report(e)
