
from mavryk.utils.persisters import persist_governance_satellite_action
from mavryk.types.governance_satellite.storage import GovernanceSatelliteStorage
from dipdup.models import Transaction
from mavryk.types.governance_satellite.parameter.unsuspend_satellite import UnsuspendSatelliteParameter
from dipdup.context import HandlerContext

async def on_governance_satellite_unsuspend_satellite(
    ctx: HandlerContext,
    unsuspend_satellite: Transaction[UnsuspendSatelliteParameter, GovernanceSatelliteStorage],
) -> None:

    # Get operation info
    await persist_governance_satellite_action(unsuspend_satellite)
