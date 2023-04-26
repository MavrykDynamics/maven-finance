from mavryk.utils.error_reporting import save_error_report
from mavryk.utils.persisters import persist_council_action
from mavryk.types.council.parameter.council_action_remove_member import CouncilActionRemoveMemberParameter
from mavryk.types.council.storage import CouncilStorage
from dipdup.context import HandlerContext
from dipdup.models import Transaction

async def on_council_council_action_remove_member(
    ctx: HandlerContext,
    council_action_remove_member: Transaction[CouncilActionRemoveMemberParameter, CouncilStorage],
) -> None:

    try:
        await persist_council_action(council_action_remove_member)
    except BaseException:
         await save_error_report()

