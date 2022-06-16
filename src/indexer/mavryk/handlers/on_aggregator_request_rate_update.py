
from mavryk.types.aggregator.parameter.request_rate_update import RequestRateUpdateParameter
from mavryk.types.aggregator.storage import AggregatorStorage
from dipdup.models import Transaction
from dipdup.context import HandlerContext

async def on_aggregator_request_rate_update(
    ctx: HandlerContext,
    request_rate_update: Transaction[RequestRateUpdateParameter, AggregatorStorage],
) -> None:
    ...
