from mavryk.utils.error_reporting import save_error_report

from dipdup.context import HandlerContext
from mavryk.utils.persisters import persist_break_glass_action
from mavryk.types.break_glass.storage import BreakGlassStorage
from mavryk.types.break_glass.parameter.pause_all_entrypoints import PauseAllEntrypointsParameter
from dipdup.models import Transaction

async def on_break_glass_pause_all_entrypoints(
    ctx: HandlerContext,
    pause_all_entrypoints: Transaction[PauseAllEntrypointsParameter, BreakGlassStorage],
) -> None:

    try:
        await persist_break_glass_action(pause_all_entrypoints)
    except BaseException as e:
         await save_error_report(e)

