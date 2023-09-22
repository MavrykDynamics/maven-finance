from mavryk.utils.error_reporting import save_error_report

from dipdup.context import HandlerContext
from mavryk.utils.persisters import persist_break_glass_action
from mavryk.types.break_glass.tezos_parameters.unpause_all_entrypoints import UnpauseAllEntrypointsParameter
from mavryk.types.break_glass.tezos_storage import BreakGlassStorage
from dipdup.models.tezos_tzkt import TzktTransaction

async def unpause_all_entrypoints(
    ctx: HandlerContext,
    unpause_all_entrypoints: TzktTransaction[UnpauseAllEntrypointsParameter, BreakGlassStorage],
) -> None:

    try:
        await persist_break_glass_action(ctx, unpause_all_entrypoints)
    except BaseException as e:
        await save_error_report(e)

