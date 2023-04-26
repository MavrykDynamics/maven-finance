from mavryk.utils.error_reporting import save_error_report

from dipdup.context import HandlerContext
from mavryk.utils.persisters import persist_break_glass_action
from mavryk.types.break_glass.storage import BreakGlassStorage
from dipdup.models import Transaction
from mavryk.types.break_glass.parameter.add_council_member import AddCouncilMemberParameter

async def on_break_glass_add_council_member(
    ctx: HandlerContext,
    add_council_member: Transaction[AddCouncilMemberParameter, BreakGlassStorage],
) -> None:

    try:    
        await persist_break_glass_action(add_council_member)
    

    except BaseException:
         await save_error_report()

