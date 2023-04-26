from mavryk.utils.error_reporting import save_error_report

from mavryk.utils.persisters import persist_linked_contract
from mavryk.types.vesting.storage import VestingStorage
from dipdup.context import HandlerContext
from mavryk.types.vesting.parameter.update_general_contracts import UpdateGeneralContractsParameter
from dipdup.models import Transaction
import mavryk.models as models

async def on_vesting_update_general_contracts(
    ctx: HandlerContext,
    update_general_contracts: Transaction[UpdateGeneralContractsParameter, VestingStorage],
) -> None:

    try:
        # Perists general contract
        await persist_linked_contract(models.Vesting, models.VestingGeneralContract, update_general_contracts)
    except BaseException:
         await save_error_report()

