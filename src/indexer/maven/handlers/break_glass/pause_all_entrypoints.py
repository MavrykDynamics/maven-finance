from maven.utils.error_reporting import save_error_report

from dipdup.context import HandlerContext
from maven.utils.persisters import persist_break_glass_action
from maven.types.break_glass.tezos_storage import BreakGlassStorage
from maven.types.break_glass.tezos_parameters.pause_all_entrypoints import PauseAllEntrypointsParameter
from dipdup.models.tezos_tzkt import TzktTransaction

async def pause_all_entrypoints(
    ctx: HandlerContext,
    pause_all_entrypoints: TzktTransaction[PauseAllEntrypointsParameter, BreakGlassStorage],
) -> None:

    try:
        await persist_break_glass_action(ctx, pause_all_entrypoints)
    except BaseException as e:
        await save_error_report(e)

