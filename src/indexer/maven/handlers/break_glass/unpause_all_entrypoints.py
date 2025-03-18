from maven.utils.error_reporting import save_error_report

from dipdup.context import HandlerContext
from maven.utils.persisters import persist_break_glass_action
from maven.types.break_glass.tezos_parameters.unpause_all_entrypoints import UnpauseAllEntrypointsParameter
from maven.types.break_glass.tezos_storage import BreakGlassStorage
from dipdup.models.tezos import TezosTransaction

async def unpause_all_entrypoints(
    ctx: HandlerContext,
    unpause_all_entrypoints: TezosTransaction[UnpauseAllEntrypointsParameter, BreakGlassStorage],
) -> None:

    try:
        await persist_break_glass_action(ctx, unpause_all_entrypoints)
    except BaseException as e:
        await save_error_report(e)

