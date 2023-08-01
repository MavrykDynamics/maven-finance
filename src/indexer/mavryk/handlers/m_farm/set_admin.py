from mavryk.utils.error_reporting import save_error_report
from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.utils.persisters import persist_admin
from mavryk.types.m_farm.parameter.set_admin import SetAdminParameter
from mavryk.types.m_farm.storage import MFarmStorage
import mavryk.models as models

async def set_admin(
    ctx: HandlerContext,
    set_admin: Transaction[SetAdminParameter, MFarmStorage],
) -> None:

    try:

        # Persist new admin
        await persist_admin(ctx, models.Farm, set_admin)

    except BaseException as e:
        await save_error_report(e)

