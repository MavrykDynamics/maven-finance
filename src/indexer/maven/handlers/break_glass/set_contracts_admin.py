from dipdup.context import HandlerContext
from dipdup.models.tezos import TezosTransaction
from maven.types.break_glass.tezos_parameters.set_contracts_admin import SetContractsAdminParameter
from maven.types.break_glass.tezos_storage import BreakGlassStorage
from maven.utils.persisters import persist_break_glass_action
from maven.utils.error_reporting import save_error_report

async def set_contracts_admin(
    ctx: HandlerContext,
    set_contracts_admin: TezosTransaction[SetContractsAdminParameter, BreakGlassStorage],
) -> None:

    try:
        await persist_break_glass_action(ctx, set_contracts_admin)

    except BaseException as e:
         await save_error_report(e)
