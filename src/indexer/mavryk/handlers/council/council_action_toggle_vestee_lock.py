from mavryk.utils.error_reporting import save_error_report
from mavryk.utils.persisters import persist_council_action
from mavryk.types.council.tezos_parameters.council_action_toggle_vestee_lock import CouncilActionToggleVesteeLockParameter
from mavryk.types.council.tezos_storage import CouncilStorage
from dipdup.context import HandlerContext
from dipdup.models.tezos_tzkt import TzktTransaction

async def council_action_toggle_vestee_lock(
    ctx: HandlerContext,
    council_action_toggle_vestee_lock: TzktTransaction[CouncilActionToggleVesteeLockParameter, CouncilStorage],
) -> None:

    try:
        await persist_council_action(ctx, council_action_toggle_vestee_lock)
    except BaseException as e:
        await save_error_report(e)

