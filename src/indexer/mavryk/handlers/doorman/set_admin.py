from mavryk.utils.error_reporting import save_error_report

from mavryk.utils.persisters import persist_admin
from mavryk.types.doorman.storage import DoormanStorage
from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.doorman.parameter.set_admin import SetAdminParameter
import mavryk.models as models

async def set_admin(
    ctx: HandlerContext,
    set_admin: Transaction[SetAdminParameter, DoormanStorage],
) -> None:

    try:

        # Persist new admin
        await persist_admin(ctx, models.Doorman, set_admin)

    except BaseException as e:
        await save_error_report(e)

