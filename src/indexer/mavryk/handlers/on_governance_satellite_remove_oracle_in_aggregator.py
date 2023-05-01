from mavryk.utils.error_reporting import save_error_report

from mavryk.utils.persisters import persist_governance_satellite_action
from mavryk.types.governance_satellite.storage import GovernanceSatelliteStorage
from mavryk.types.governance_satellite.parameter.remove_oracle_in_aggregator import RemoveOracleInAggregatorParameter
from dipdup.models import Transaction
from dipdup.context import HandlerContext

async def on_governance_satellite_remove_oracle_in_aggregator(
    ctx: HandlerContext,
    remove_oracle_in_aggregator: Transaction[RemoveOracleInAggregatorParameter, GovernanceSatelliteStorage],
) -> None:

    try:
        # Get operation info
        await persist_governance_satellite_action(ctx, remove_oracle_in_aggregator)

    except BaseException as e:
         await save_error_report(e)

