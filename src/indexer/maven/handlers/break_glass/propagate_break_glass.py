from maven.utils.error_reporting import save_error_report

from dipdup.context import HandlerContext
from dipdup.models.tezos_tzkt import TzktTransaction
from maven.utils.persisters import persist_break_glass_action
from maven.types.break_glass.tezos_parameters.propagate_break_glass import PropagateBreakGlassParameter
from maven.types.break_glass.tezos_storage import BreakGlassStorage

async def propagate_break_glass(
    ctx: HandlerContext,
    propagate_break_glass: TzktTransaction[PropagateBreakGlassParameter, BreakGlassStorage],
) -> None:

    try:    
        await persist_break_glass_action(ctx, propagate_break_glass)
    except BaseException as e:
        await save_error_report(e)

