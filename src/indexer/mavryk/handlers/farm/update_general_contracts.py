from mavryk.utils.error_reporting import save_error_report

from dipdup.context import HandlerContext
from mavryk.utils.persisters import persist_linked_contract
from mavryk.types.farm.storage import FarmStorage
from dipdup.models import Transaction
from mavryk.types.farm.parameter.update_general_contracts import UpdateGeneralContractsParameter
import mavryk.models as models

async def update_general_contracts(
    ctx: HandlerContext,
    update_general_contracts: Transaction[UpdateGeneralContractsParameter, FarmStorage],
) -> None:

    try:
        # Perists general contract
        await persist_linked_contract(ctx, models.Farm, models.FarmGeneralContract, update_general_contracts)

    except BaseException as e:
        await save_error_report(e)

