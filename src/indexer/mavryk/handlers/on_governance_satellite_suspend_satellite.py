
from mavryk.utils.persisters import persist_governance_satellite_action
from mavryk.types.governance_satellite.storage import GovernanceSatelliteStorage
from dipdup.models import Transaction
from mavryk.types.governance_satellite.parameter.suspend_satellite import SuspendSatelliteParameter
from dipdup.context import HandlerContext

async def on_governance_satellite_suspend_satellite(
    ctx: HandlerContext,
    suspend_satellite: Transaction[SuspendSatelliteParameter, GovernanceSatelliteStorage],
) -> None:

    # Get operation info
    await persist_governance_satellite_action(suspend_satellite)
