
from mavryk.utils.persisters import persist_governance_satellite_action
from mavryk.types.governance_satellite.storage import GovernanceSatelliteStorage
from mavryk.types.governance_satellite.parameter.update_aggregator_status import UpdateAggregatorStatusParameter
from dipdup.models import Transaction
from dipdup.context import HandlerContext

async def on_governance_satellite_update_aggregator_status(
    ctx: HandlerContext,
    update_aggregator_status: Transaction[UpdateAggregatorStatusParameter, GovernanceSatelliteStorage],
) -> None:

    # Get operation info
    await persist_governance_satellite_action(update_aggregator_status)
