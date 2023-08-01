from mavryk.utils.error_reporting import save_error_report

from mavryk.utils.persisters import persist_linked_contract
from mavryk.types.break_glass.parameter.update_general_contracts import UpdateGeneralContractsParameter
from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.break_glass.storage import BreakGlassStorage
import mavryk.models as models

async def update_general_contracts(
    ctx: HandlerContext,
    update_general_contracts: Transaction[UpdateGeneralContractsParameter, BreakGlassStorage],
) -> None:

    try:
        # Perists general contract
        await persist_linked_contract(ctx, models.BreakGlass, models.BreakGlassGeneralContract, update_general_contracts)

    except BaseException as e:
        await save_error_report(e)

