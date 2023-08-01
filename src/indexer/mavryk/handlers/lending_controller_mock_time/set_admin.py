from mavryk.utils.error_reporting import save_error_report

from mavryk.utils.persisters import persist_admin
from mavryk.types.lending_controller_mock_time.tezos_storage import LendingControllerMockTimeStorage
from dipdup.models.tezos_tzkt import TzktTransaction
from dipdup.context import HandlerContext
from mavryk.types.lending_controller_mock_time.tezos_parameters.set_admin import SetAdminParameter
import mavryk.models as models

async def set_admin(
    ctx: HandlerContext,
    set_admin: TzktTransaction[SetAdminParameter, LendingControllerMockTimeStorage],
) -> None:

    try:

        # Persist new admin
        await persist_admin(ctx, models.LendingController, set_admin)

    except BaseException as e:
        await save_error_report(e)

