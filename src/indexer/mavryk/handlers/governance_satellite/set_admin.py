from mavryk.utils.error_reporting import save_error_report

from mavryk.utils.persisters import persist_admin
from mavryk.types.governance_satellite.parameter.set_admin import SetAdminParameter
from mavryk.types.governance_satellite.storage import GovernanceSatelliteStorage
from dipdup.models import Transaction
from dipdup.context import HandlerContext
import mavryk.models as models

async def set_admin(
    ctx: HandlerContext,
    set_admin: Transaction[SetAdminParameter, GovernanceSatelliteStorage],
) -> None:

    try:

        # Persist new admin
        await persist_admin(ctx, models.GovernanceSatellite, set_admin)

    except BaseException as e:
        await save_error_report(e)

