
from dipdup.context import HandlerContext
from mavryk.utils.persisters import persist_linked_contract
from mavryk.types.lending_controller.parameter.update_whitelist_contracts import UpdateWhitelistContractsParameter
from dipdup.models import Transaction
from mavryk.types.lending_controller.storage import LendingControllerStorage
import mavryk.models as models

async def on_lending_controller_update_whitelist_contracts(
    ctx: HandlerContext,
    update_whitelist_contracts: Transaction[UpdateWhitelistContractsParameter, LendingControllerStorage],
) -> None:

    # Persist whitelist contract
    await persist_linked_contract(models.LendingController, models.LendingControllerWhitelistContract, update_whitelist_contracts)
