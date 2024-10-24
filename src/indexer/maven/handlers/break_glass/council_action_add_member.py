from dipdup.context import HandlerContext
from dipdup.models.tezos import TezosTransaction
from maven.types.break_glass.tezos_parameters.council_action_add_member import CouncilActionAddMemberParameter
from maven.types.break_glass.tezos_storage import BreakGlassStorage
from maven.utils.persisters import persist_break_glass_action
from maven.utils.error_reporting import save_error_report


async def council_action_add_member(
    ctx: HandlerContext,
    council_action_add_member: TezosTransaction[CouncilActionAddMemberParameter, BreakGlassStorage],
) -> None:

    try:    
        await persist_break_glass_action(ctx, council_action_add_member)

    except BaseException as e:
         await save_error_report(e)
