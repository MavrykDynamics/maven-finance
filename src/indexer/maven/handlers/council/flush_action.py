from maven.utils.error_reporting import save_error_report

from dipdup.models.tezos import TezosTransaction
from maven.utils.persisters import persist_council_action
from maven.types.council.tezos_storage import CouncilStorage
from maven.types.council.tezos_parameters.flush_action import FlushActionParameter
from dipdup.context import HandlerContext

async def flush_action(
    ctx: HandlerContext,
    flush_action: TezosTransaction[FlushActionParameter, CouncilStorage],
) -> None:

    try:
        await persist_council_action(ctx, flush_action)
    except BaseException as e:
        await save_error_report(e)

