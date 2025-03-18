from maven.utils.error_reporting import save_error_report

from dipdup.context import HandlerContext
from maven.utils.persisters import persist_break_glass_action
from maven.types.break_glass.tezos_parameters.remove_break_glass_control import RemoveBreakGlassControlParameter
from maven.types.break_glass.tezos_storage import BreakGlassStorage
from dipdup.models.tezos import TezosTransaction

async def remove_break_glass_control(
    ctx: HandlerContext,
    remove_break_glass_control: TezosTransaction[RemoveBreakGlassControlParameter, BreakGlassStorage],
) -> None:

    try:
        await persist_break_glass_action(ctx, remove_break_glass_control)
    except BaseException as e:
        await save_error_report(e)

