
from dipdup.models import Transaction
from mavryk.types.aggregator_factory.parameter.track_aggregator import TrackAggregatorParameter
from mavryk.types.aggregator_factory.storage import AggregatorFactoryStorage
from dipdup.context import HandlerContext

async def on_aggregator_factory_track_aggregator(
    ctx: HandlerContext,
    track_aggregator: Transaction[TrackAggregatorParameter, AggregatorFactoryStorage],
) -> None:
    ...