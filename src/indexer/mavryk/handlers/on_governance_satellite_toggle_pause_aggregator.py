from mavryk.utils.persisters import persist_governance_satellite_action
from mavryk.types.governance_satellite.storage import GovernanceSatelliteStorage
from dipdup.models import Transaction
from dipdup.context import HandlerContext
from mavryk.types.governance_satellite.parameter.toggle_pause_aggregator import TogglePauseAggregatorParameter

async def on_governance_satellite_toggle_pause_aggregator(
    ctx: HandlerContext,
    toggle_pause_aggregator: Transaction[TogglePauseAggregatorParameter, GovernanceSatelliteStorage],
) -> None:

    # Get operation info
    await persist_governance_satellite_action(ctx, toggle_pause_aggregator)
