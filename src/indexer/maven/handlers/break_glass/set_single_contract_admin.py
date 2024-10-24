from maven.utils.error_reporting import save_error_report

from dipdup.context import HandlerContext
from maven.utils.persisters import persist_break_glass_action
from maven.types.break_glass.tezos_storage import BreakGlassStorage
from maven.types.break_glass.tezos_parameters.set_single_contract_admin import SetSingleContractAdminParameter
from dipdup.models.tezos import TezosTransaction

async def set_single_contract_admin(
    ctx: HandlerContext,
    set_single_contract_admin: TezosTransaction[SetSingleContractAdminParameter, BreakGlassStorage],
) -> None:

    try:
        await persist_break_glass_action(ctx, set_single_contract_admin)
    except BaseException as e:
        await save_error_report(e)

