
from mavryk.types.aggregator.storage import AggregatorStorage
from dipdup.models import Transaction
from mavryk.types.aggregator.parameter.toggle_pause_request_rate_update_dev import TogglePauseRequestRateUpdateDevParameter
from dipdup.context import HandlerContext

async def on_aggregator_toggle_pause_request_rate_update_dev(
    ctx: HandlerContext,
    toggle_pause_request_rate_update_dev: Transaction[TogglePauseRequestRateUpdateDevParameter, AggregatorStorage],
) -> None:
    ...