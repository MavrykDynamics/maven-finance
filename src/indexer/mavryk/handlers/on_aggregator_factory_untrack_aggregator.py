
from dipdup.models import Transaction
from mavryk.types.aggregator_factory.storage import AggregatorFactoryStorage
from mavryk.types.aggregator_factory.parameter.untrack_aggregator import UntrackAggregatorParameter
from dipdup.context import HandlerContext

async def on_aggregator_factory_untrack_aggregator(
    ctx: HandlerContext,
    untrack_aggregator: Transaction[UntrackAggregatorParameter, AggregatorFactoryStorage],
) -> None:
    ...