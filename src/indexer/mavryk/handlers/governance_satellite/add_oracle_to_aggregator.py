from mavryk.utils.error_reporting import save_error_report

from mavryk.utils.persisters import persist_governance_satellite_action
from mavryk.types.governance_satellite.tezos_storage import GovernanceSatelliteStorage
from dipdup.models.tezos_tzkt import TzktTransaction
from mavryk.types.governance_satellite.tezos_parameters.add_oracle_to_aggregator import AddOracleToAggregatorParameter
from dipdup.context import HandlerContext

async def add_oracle_to_aggregator(
    ctx: HandlerContext,
    add_oracle_to_aggregator: TzktTransaction[AddOracleToAggregatorParameter, GovernanceSatelliteStorage],
) -> None:

    try:
        # Get operation info
        await persist_governance_satellite_action(ctx, add_oracle_to_aggregator)

    except BaseException as e:
        await save_error_report(e)

