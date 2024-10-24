from maven.utils.error_reporting import save_error_report

from dipdup.context import HandlerContext
from maven.utils.persisters import persist_break_glass_action
from maven.types.break_glass.tezos_storage import BreakGlassStorage
from dipdup.models.tezos import TezosTransaction
from maven.types.break_glass.tezos_parameters.flush_action import FlushActionParameter

async def flush_action(
    ctx: HandlerContext,
    flush_action: TezosTransaction[FlushActionParameter, BreakGlassStorage],
) -> None:

    try:
        await persist_break_glass_action(ctx, flush_action)
    except BaseException as e:
        await save_error_report(e)

