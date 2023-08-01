from mavryk.utils.error_reporting import save_error_report
from dipdup.context import HandlerContext
from mavryk.utils.persisters import persist_council_action
from mavryk.types.council.storage import CouncilStorage
from dipdup.models import Transaction
from mavryk.types.council.parameter.council_action_change_member import CouncilActionChangeMemberParameter

async def council_action_change_member(
    ctx: HandlerContext,
    council_action_change_member: Transaction[CouncilActionChangeMemberParameter, CouncilStorage],
) -> None:

    try:
        await persist_council_action(ctx, council_action_change_member)
    except BaseException as e:
        await save_error_report(e)

