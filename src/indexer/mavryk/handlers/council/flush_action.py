from mavryk.utils.error_reporting import save_error_report

from dipdup.models import Transaction
from mavryk.utils.persisters import persist_council_action
from mavryk.types.council.storage import CouncilStorage
from mavryk.types.council.parameter.flush_action import FlushActionParameter
from dipdup.context import HandlerContext

async def flush_action(
    ctx: HandlerContext,
    flush_action: Transaction[FlushActionParameter, CouncilStorage],
) -> None:

    try:
        await persist_council_action(ctx, flush_action)
    except BaseException as e:
        await save_error_report(e)

