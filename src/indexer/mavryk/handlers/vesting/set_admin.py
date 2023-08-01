from mavryk.utils.error_reporting import save_error_report

from mavryk.utils.persisters import persist_admin
from mavryk.types.vesting.storage import VestingStorage
from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.vesting.parameter.set_admin import SetAdminParameter
import mavryk.models as models

async def set_admin(
    ctx: HandlerContext,
    set_admin: Transaction[SetAdminParameter, VestingStorage],
) -> None:

    try:

        # Persist new admin
        await persist_admin(ctx, models.Vesting, set_admin)

    except BaseException as e:
        await save_error_report(e)

