from mavryk.utils.error_reporting import save_error_report

from mavryk.utils.persisters import persist_admin
from mavryk.types.lending_controller_mock_time.storage import LendingControllerMockTimeStorage
from dipdup.models import Transaction
from dipdup.context import HandlerContext
from mavryk.types.lending_controller_mock_time.parameter.set_admin import SetAdminParameter
import mavryk.models as models

async def on_lending_controller_mock_time_set_admin(
    ctx: HandlerContext,
    set_admin: Transaction[SetAdminParameter, LendingControllerMockTimeStorage],
) -> None:

    try:    
        # Get operation info
        target_contract = set_admin.data.target_address
        contract        = await models.LendingController.get(
            address         = target_contract,
            mock_time       = True
        )
    
        # Persist new admin
        await persist_admin(set_admin, contract)

    except BaseException as e:
         await save_error_report(e)

