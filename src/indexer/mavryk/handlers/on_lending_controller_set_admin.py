from mavryk.utils.error_reporting import save_error_report

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

    try:

        # Persist new admin
        await persist_admin(ctx, models.LendingController, set_admin)

    except BaseException as e:
         await save_error_report(e)

