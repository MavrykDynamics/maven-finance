from mavryk.utils.error_reporting import save_error_report
from mavryk.utils.persisters import persist_council_action
from mavryk.types.council.parameter.council_action_add_vestee import CouncilActionAddVesteeParameter
from dipdup.models import Transaction
from dipdup.context import HandlerContext
from mavryk.types.council.storage import CouncilStorage

async def on_council_council_action_add_vestee(
    ctx: HandlerContext,
    council_action_add_vestee: Transaction[CouncilActionAddVesteeParameter, CouncilStorage],
) -> None:

    try:
        await persist_council_action(ctx, council_action_add_vestee)
    except BaseException as e:
         await save_error_report(e)

