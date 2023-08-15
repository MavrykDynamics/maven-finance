from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.utils.persisters import persist_break_glass_action
from mavryk.utils.error_reporting import save_error_report
from mavryk.types.break_glass.parameter.set_contracts_admin import SetContractsAdminParameter
from mavryk.types.break_glass.storage import BreakGlassStorage


async def on_break_glass_set_contracts_admin(
    ctx: HandlerContext,
    set_contracts_admin: Transaction[SetContractsAdminParameter, BreakGlassStorage],
) -> None:

    try:
        await persist_break_glass_action(ctx, set_contracts_admin)

    except BaseException as e:
         await save_error_report(e)
