
from maven.utils.error_reporting import save_error_report

from dipdup.context import HandlerContext
from maven.utils.persisters import persist_break_glass_action
from maven.types.break_glass.tezos_storage import BreakGlassStorage
from dipdup.models.tezos_tzkt import TzktTransaction
from maven.types.break_glass.tezos_parameters.add_council_member import AddCouncilMemberParameter

async def add_council_member(
    ctx: HandlerContext,
    add_council_member: TzktTransaction[AddCouncilMemberParameter, BreakGlassStorage],
) -> None:

    try:    
        await persist_break_glass_action(ctx, add_council_member)
    

    except BaseException as e:
        await save_error_report(e)

