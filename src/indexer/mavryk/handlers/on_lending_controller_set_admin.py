
from dipdup.context import HandlerContext
from mavryk.utils.persisters import persist_admin
from mavryk.types.lending_controller.parameter.set_admin import SetAdminParameter
from dipdup.models import Transaction
from mavryk.types.lending_controller.storage import LendingControllerStorage
import mavryk.models as models

async def on_lending_controller_set_admin(
    ctx: HandlerContext,
    set_admin: Transaction[SetAdminParameter, LendingControllerStorage],
) -> None:
    
    # Get operation info
    target_contract = set_admin.data.target_address
    contract        = await models.LendingController.get(address = target_contract)

    # Persist new admin
    await persist_admin(set_admin, contract)
