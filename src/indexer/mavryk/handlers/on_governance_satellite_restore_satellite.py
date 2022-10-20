
from mavryk.utils.persisters import persist_governance_satellite_action
from mavryk.types.governance_satellite.parameter.restore_satellite import RestoreSatelliteParameter
from dipdup.context import HandlerContext
from mavryk.types.governance_satellite.storage import GovernanceSatelliteStorage
from dipdup.models import Transaction

async def on_governance_satellite_restore_satellite(
    ctx: HandlerContext,
    restore_satellite: Transaction[RestoreSatelliteParameter, GovernanceSatelliteStorage],
) -> None:

    # Get operation info
    await persist_governance_satellite_action(ctx, restore_satellite)
