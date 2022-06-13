
from dipdup.models import Origination
from mavryk.types.aggregator_factory.storage import AggregatorFactoryStorage
from dipdup.context import HandlerContext

async def on_aggregator_factory_origination(
    ctx: HandlerContext,
    aggregator_factory_origination: Origination[AggregatorFactoryStorage],
) -> None:
    ...