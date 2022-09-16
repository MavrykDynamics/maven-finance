
from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.utils.persisters import persist_linked_contract
from mavryk.types.lending_controller.parameter.update_general_contracts import UpdateGeneralContractsParameter
from mavryk.types.lending_controller.storage import LendingControllerStorage
import mavryk.models as models

async def on_lending_controller_update_general_contracts(
    ctx: HandlerContext,
    update_general_contracts: Transaction[UpdateGeneralContractsParameter, LendingControllerStorage],
) -> None:

    # Persist whitelist contract
    await persist_linked_contract(models.LendingController, models.LendingControllerGeneralContract, update_general_contracts)
