from mavryk.utils.error_reporting import save_error_report

from dipdup.context import HandlerContext
from mavryk.utils.persisters import persist_break_glass_action
from mavryk.types.break_glass.tezos_storage import BreakGlassStorage
from dipdup.models.tezos_tzkt import TzktTransaction
from mavryk.types.break_glass.tezos_parameters.flush_action import FlushActionParameter

async def flush_action(
    ctx: HandlerContext,
    flush_action: TzktTransaction[FlushActionParameter, BreakGlassStorage],
) -> None:

    try:
        await persist_break_glass_action(ctx, flush_action)
    except BaseException as e:
        await save_error_report(e)

