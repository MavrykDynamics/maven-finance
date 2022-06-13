
from mavryk.types.governance_satellite.storage import GovernanceSatelliteStorage
from dipdup.models import Transaction
from mavryk.types.governance_satellite.parameter.add_oracle_to_aggregator import AddOracleToAggregatorParameter
from dipdup.context import HandlerContext

async def on_governance_satellite_add_oracle_to_aggregator(
    ctx: HandlerContext,
    add_oracle_to_aggregator: Transaction[AddOracleToAggregatorParameter, GovernanceSatelliteStorage],
) -> None:
    breakpoint()