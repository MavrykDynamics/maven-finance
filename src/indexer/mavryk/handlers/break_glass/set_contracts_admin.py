from dipdup.context import HandlerContext
from dipdup.models.tezos_tzkt import TzktTransaction
from mavryk.types.break_glass.tezos_parameters.set_contracts_admin import SetContractsAdminParameter
from mavryk.types.break_glass.tezos_storage import BreakGlassStorage
from mavryk.utils.persisters import persist_break_glass_action
from mavryk.utils.error_reporting import save_error_report

async def set_contracts_admin(
    ctx: HandlerContext,
    set_contracts_admin: TzktTransaction[SetContractsAdminParameter, BreakGlassStorage],
) -> None:

    try:
        await persist_break_glass_action(ctx, set_contracts_admin)

    except BaseException as e:
         await save_error_report(e)
