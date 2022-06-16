
from mavryk.types.aggregator.parameter.toggle_pause_request_rate_update import TogglePauseRequestRateUpdateParameter
from mavryk.types.aggregator.storage import AggregatorStorage
from dipdup.models import Transaction
from dipdup.context import HandlerContext

async def on_aggregator_toggle_pause_request_rate_update(
    ctx: HandlerContext,
    toggle_pause_request_rate_update: Transaction[TogglePauseRequestRateUpdateParameter, AggregatorStorage],
) -> None:
    ...
