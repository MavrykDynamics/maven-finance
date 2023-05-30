from mavryk.utils.error_reporting import save_error_report

from dipdup.context import HandlerContext
from mavryk.utils.persisters import persist_admin
from mavryk.types.farm.storage import FarmStorage
from dipdup.models import Transaction
from mavryk.types.farm.parameter.set_admin import SetAdminParameter
import mavryk.models as models

async def on_farm_set_admin(
    ctx: HandlerContext,
    set_admin: Transaction[SetAdminParameter, FarmStorage],
) -> None:

    try:

        # Persist new admin
        await persist_admin(ctx, models.Farm, set_admin)

    except BaseException as e:
         await save_error_report(e)

