from mavryk.utils.error_reporting import save_error_report
from mavryk.utils.persisters import persist_council_action
from mavryk.types.council.parameter.council_action_toggle_vestee_lock import CouncilActionToggleVesteeLockParameter
from mavryk.types.council.storage import CouncilStorage
from dipdup.context import HandlerContext
from dipdup.models import Transaction

async def council_action_toggle_vestee_lock(
    ctx: HandlerContext,
    council_action_toggle_vestee_lock: Transaction[CouncilActionToggleVesteeLockParameter, CouncilStorage],
) -> None:

    try:
        await persist_council_action(ctx, council_action_toggle_vestee_lock)
    except BaseException as e:
        await save_error_report(e)

