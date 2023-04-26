from mavryk.utils.error_reporting import save_error_report

from dipdup.context import HandlerContext
from mavryk.utils.persisters import persist_governance
from mavryk.types.lending_controller.storage import LendingControllerStorage
from dipdup.models import Transaction
from mavryk.types.lending_controller.parameter.set_governance import SetGovernanceParameter
import mavryk.models as models

async def on_lending_controller_set_governance(
    ctx: HandlerContext,
    set_governance: Transaction[SetGovernanceParameter, LendingControllerStorage],
) -> None:

    try:    
        # Get operation info
        target_contract = set_governance.data.target_address
        contract        = await models.LendingController.get(
            address     = target_contract,
            mock_time   = False
        )
    
        # Persist new admin
        await persist_governance(set_governance, contract)

    except BaseException:
         await save_error_report()

