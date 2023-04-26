from mavryk.utils.error_reporting import save_error_report

from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.utils.persisters import persist_linked_contract
from mavryk.types.treasury.parameter.update_general_contracts import UpdateGeneralContractsParameter
from mavryk.types.treasury.storage import TreasuryStorage
import mavryk.models as models

async def on_treasury_update_general_contracts(
    ctx: HandlerContext,
    update_general_contracts: Transaction[UpdateGeneralContractsParameter, TreasuryStorage],
) -> None:

    try:
        # Perists general contract
        await persist_linked_contract(models.Treasury, models.TreasuryGeneralContract, update_general_contracts)

    except BaseException:
         await save_error_report()

