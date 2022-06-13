
from dipdup.context import HandlerContext
from mavryk.types.governance_satellite.parameter.register_aggregator import RegisterAggregatorParameter
from mavryk.types.governance_satellite.storage import GovernanceSatelliteStorage
from dipdup.models import Transaction

async def on_governance_satellite_register_aggregator(
    ctx: HandlerContext,
    register_aggregator: Transaction[RegisterAggregatorParameter, GovernanceSatelliteStorage],
) -> None:
    breakpoint()