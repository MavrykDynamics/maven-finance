from maven.utils.error_reporting import save_error_report
from maven.utils.persisters import persist_council_action
from maven.types.council.tezos_parameters.council_action_toggle_vestee_lock import CouncilActionToggleVesteeLockParameter
from maven.types.council.tezos_storage import CouncilStorage
from dipdup.context import HandlerContext
from dipdup.models.tezos import TezosTransaction

async def council_action_toggle_vestee_lock(
    ctx: HandlerContext,
    council_action_toggle_vestee_lock: TezosTransaction[CouncilActionToggleVesteeLockParameter, CouncilStorage],
) -> None:

    try:
        await persist_council_action(ctx, council_action_toggle_vestee_lock)
    except BaseException as e:
        await save_error_report(e)

