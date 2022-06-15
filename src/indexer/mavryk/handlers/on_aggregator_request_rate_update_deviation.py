
from mavryk.types.aggregator.storage import AggregatorStorage
from dipdup.models import Transaction
from mavryk.types.aggregator.parameter.request_rate_update_deviation import RequestRateUpdateDeviationParameter
from dipdup.context import HandlerContext

async def on_aggregator_request_rate_update_deviation(
    ctx: HandlerContext,
    request_rate_update_deviation: Transaction[RequestRateUpdateDeviationParameter, AggregatorStorage],
) -> None:

    # Get operation info
    breakpoint()
