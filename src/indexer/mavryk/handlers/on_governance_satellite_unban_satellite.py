
from mavryk.utils.persisters import persist_governance_satellite_action
from mavryk.types.governance_satellite.parameter.unban_satellite import UnbanSatelliteParameter
from mavryk.types.governance_satellite.storage import GovernanceSatelliteStorage
from dipdup.models import Transaction
from dipdup.context import HandlerContext

async def on_governance_satellite_unban_satellite(
    ctx: HandlerContext,
    unban_satellite: Transaction[UnbanSatelliteParameter, GovernanceSatelliteStorage],
) -> None:

    # Get operation info
    await persist_governance_satellite_action(unban_satellite)
