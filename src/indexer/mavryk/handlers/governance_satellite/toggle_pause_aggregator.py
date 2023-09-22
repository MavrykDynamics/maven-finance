from mavryk.utils.error_reporting import save_error_report
from mavryk.utils.persisters import persist_governance_satellite_action
from mavryk.types.governance_satellite.tezos_storage import GovernanceSatelliteStorage
from dipdup.models.tezos_tzkt import TzktTransaction
from dipdup.context import HandlerContext
from mavryk.types.governance_satellite.tezos_parameters.toggle_pause_aggregator import TogglePauseAggregatorParameter

async def toggle_pause_aggregator(
    ctx: HandlerContext,
    toggle_pause_aggregator: TzktTransaction[TogglePauseAggregatorParameter, GovernanceSatelliteStorage],
) -> None:

    try:
        # Get operation info
        await persist_governance_satellite_action(ctx, toggle_pause_aggregator)

    except BaseException as e:
        await save_error_report(e)

