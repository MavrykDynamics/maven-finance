from mavryk.utils.error_reporting import save_error_report

from dipdup.context import HandlerContext
from mavryk.utils.persisters import persist_break_glass_action
from mavryk.types.break_glass.storage import BreakGlassStorage
from mavryk.types.break_glass.parameter.set_single_contract_admin import SetSingleContractAdminParameter
from dipdup.models import Transaction

async def on_break_glass_set_single_contract_admin(
    ctx: HandlerContext,
    set_single_contract_admin: Transaction[SetSingleContractAdminParameter, BreakGlassStorage],
) -> None:

    try:
        await persist_break_glass_action(ctx, set_single_contract_admin)
    except BaseException as e:
         await save_error_report(e)

