from mavryk.utils.error_reporting import save_error_report

from mavryk.utils.persisters import persist_governance
from mavryk.types.lending_controller_mock_time.storage import LendingControllerMockTimeStorage
from dipdup.models import Transaction
from dipdup.context import HandlerContext
from mavryk.types.lending_controller_mock_time.parameter.set_governance import SetGovernanceParameter
import mavryk.models as models

async def on_lending_controller_mock_time_set_governance(
    ctx: HandlerContext,
    set_governance: Transaction[SetGovernanceParameter, LendingControllerMockTimeStorage],
) -> None:

    try:

        # Persist new governance
        await persist_governance(ctx, models.LendingController, set_governance)

    except BaseException as e:
         await save_error_report(e)

