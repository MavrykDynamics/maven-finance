from mavryk.utils.error_reporting import save_error_report

from mavryk.utils.persisters import persist_governance_satellite_action
from mavryk.types.governance_satellite.storage import GovernanceSatelliteStorage
from dipdup.models import Transaction
from mavryk.types.governance_satellite.parameter.suspend_satellite import SuspendSatelliteParameter
from dipdup.context import HandlerContext

async def suspend_satellite(
    ctx: HandlerContext,
    suspend_satellite: Transaction[SuspendSatelliteParameter, GovernanceSatelliteStorage],
) -> None:

    try:
        # Get operation info
        await persist_governance_satellite_action(ctx, suspend_satellite)

    except BaseException as e:
        await save_error_report(e)

