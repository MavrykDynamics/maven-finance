from mavryk.utils.error_reporting import save_error_report

from dipdup.context import HandlerContext
from mavryk.utils.persisters import persist_linked_contract
from mavryk.types.council.parameter.update_general_contracts import UpdateGeneralContractsParameter
from dipdup.models import Transaction
from mavryk.types.council.storage import CouncilStorage
import mavryk.models as models

async def on_council_update_general_contracts(
    ctx: HandlerContext,
    update_general_contracts: Transaction[UpdateGeneralContractsParameter, CouncilStorage],
) -> None:

    try:
        # Perists general contract
        await persist_linked_contract(ctx, models.Council, models.CouncilGeneralContract, update_general_contracts)

    except BaseException as e:
         await save_error_report(e)

