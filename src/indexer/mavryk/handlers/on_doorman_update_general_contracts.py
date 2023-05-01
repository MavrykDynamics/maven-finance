from mavryk.utils.error_reporting import save_error_report

from mavryk.utils.persisters import persist_linked_contract
from mavryk.types.doorman.storage import DoormanStorage
from dipdup.context import HandlerContext
from mavryk.types.doorman.parameter.update_general_contracts import UpdateGeneralContractsParameter
from dipdup.models import Transaction
import mavryk.models as models

async def on_doorman_update_general_contracts(
    ctx: HandlerContext,
    update_general_contracts: Transaction[UpdateGeneralContractsParameter, DoormanStorage],
) -> None:

    try:
        # Perists general contract
        await persist_linked_contract(models.Doorman, models.DoormanGeneralContract, update_general_contracts)

    except BaseException as e:
         await save_error_report(e)

