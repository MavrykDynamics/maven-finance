
from dipdup.models import Origination
from mavryk.types.aggregator.storage import AggregatorStorage
from dipdup.context import HandlerContext

async def on_aggregator_origination(
    ctx: HandlerContext,
    aggregator_origination: Origination[AggregatorStorage],
) -> None:
    ...