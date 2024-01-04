from maven.utils.error_reporting import save_error_report

from maven.utils.persisters import persist_governance_satellite_action
from maven.types.governance_satellite.tezos_storage import GovernanceSatelliteStorage
from maven.types.governance_satellite.tezos_parameters.remove_oracle_in_aggregator import RemoveOracleInAggregatorParameter
from dipdup.models.tezos_tzkt import TzktTransaction
from dipdup.context import HandlerContext

async def remove_oracle_in_aggregator(
    ctx: HandlerContext,
    remove_oracle_in_aggregator: TzktTransaction[RemoveOracleInAggregatorParameter, GovernanceSatelliteStorage],
) -> None:

    try:
        # Get operation info
        await persist_governance_satellite_action(ctx, remove_oracle_in_aggregator)

    except BaseException as e:
        await save_error_report(e)

