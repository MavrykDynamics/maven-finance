from maven.utils.error_reporting import save_error_report
from maven.utils.persisters import persist_council_action
from maven.types.council.tezos_storage import CouncilStorage
from maven.types.council.tezos_parameters.council_action_update_vestee import CouncilActionUpdateVesteeParameter
from dipdup.context import HandlerContext
from dipdup.models.tezos import TezosTransaction

async def council_action_update_vestee(
    ctx: HandlerContext,
    council_action_update_vestee: TezosTransaction[CouncilActionUpdateVesteeParameter, CouncilStorage],
) -> None:

    try:
        await persist_council_action(ctx, council_action_update_vestee)
    except BaseException as e:
        await save_error_report(e)

