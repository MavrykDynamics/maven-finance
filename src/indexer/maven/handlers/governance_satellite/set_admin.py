from maven.utils.error_reporting import save_error_report

from maven.utils.persisters import persist_admin
from maven.types.governance_satellite.tezos_parameters.set_admin import SetAdminParameter
from maven.types.governance_satellite.tezos_storage import GovernanceSatelliteStorage
from dipdup.models.tezos_tzkt import TzktTransaction
from dipdup.context import HandlerContext
import maven.models as models

async def set_admin(
    ctx: HandlerContext,
    set_admin: TzktTransaction[SetAdminParameter, GovernanceSatelliteStorage],
) -> None:

    try:

        # Persist new admin
        await persist_admin(ctx, models.GovernanceSatellite, set_admin)

    except BaseException as e:
        await save_error_report(e)

