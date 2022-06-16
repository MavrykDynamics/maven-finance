
from dipdup.models import Transaction
from mavryk.types.aggregator_factory.parameter.track_aggregator import TrackAggregatorParameter
from mavryk.types.aggregator_factory.storage import AggregatorFactoryStorage
from dipdup.context import HandlerContext
import mavryk.models as models

async def on_aggregator_factory_track_aggregator(
    ctx: HandlerContext,
    track_aggregator: Transaction[TrackAggregatorParameter, AggregatorFactoryStorage],
) -> None:

    # Get operation info
    aggregator_factory_address  = track_aggregator.data.target_address
    aggregator_address          = track_aggregator.parameter.aggregatorAddress
    token_0_symbol              = track_aggregator.parameter.pairFirst
    token_1_symbol              = track_aggregator.parameter.pairSecond

    # Update record
    aggregator_factory  = await models.AggregatorFactory.get(
        address = aggregator_factory_address
    )
    aggregator          = await models.Aggregator.get_or_none(
        address = aggregator_address
    )
    if aggregator:
        aggregator.aggregator_factory   = aggregator_factory
        aggregator.token_0_symbol       = token_0_symbol
        aggregator.token_1_symbol       = token_1_symbol
        await aggregator.save()
