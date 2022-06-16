
from mavryk.types.aggregator.parameter.set_maintainer import SetMaintainerParameter
from mavryk.types.aggregator.storage import AggregatorStorage
from dipdup.models import Transaction
from dipdup.context import HandlerContext

async def on_aggregator_set_maintainer(
    ctx: HandlerContext,
    set_maintainer: Transaction[SetMaintainerParameter, AggregatorStorage],
) -> None:
    ...
