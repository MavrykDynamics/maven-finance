from maven.utils.error_reporting import save_error_report
from maven.utils.persisters import persist_council_action
from maven.types.council.tezos_parameters.council_action_remove_vestee import CouncilActionRemoveVesteeParameter
from maven.types.council.tezos_storage import CouncilStorage
from dipdup.context import HandlerContext
from dipdup.models.tezos import TezosTransaction

async def council_action_remove_vestee(
    ctx: HandlerContext,
    council_action_remove_vestee: TezosTransaction[CouncilActionRemoveVesteeParameter, CouncilStorage],
) -> None:

    try:
        await persist_council_action(ctx, council_action_remove_vestee)
    except BaseException as e:
        await save_error_report(e)

