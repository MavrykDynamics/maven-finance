
from dipdup.models import Transaction
from mavryk.types.aggregator_factory.storage import AggregatorFactoryStorage
from mavryk.types.aggregator_factory.parameter.untrack_aggregator import UntrackAggregatorParameter
from dipdup.context import HandlerContext
import mavryk.models as models

async def on_aggregator_factory_untrack_aggregator(
    ctx: HandlerContext,
    untrack_aggregator: Transaction[UntrackAggregatorParameter, AggregatorFactoryStorage],
) -> None:

    # Get operation info
    aggregator_factory_address  = untrack_aggregator.data.target_address
    aggregator_pair_first       = untrack_aggregator.parameter.pairFirst
    aggregator_pair_second      = untrack_aggregator.parameter.pairSecond

    # Update record
    aggregator_factory          = await models.AggregatorFactory.get(
        address = aggregator_factory_address
    )
    aggregator                  = await models.Aggregator.get_or_none(
        factory             = aggregator_factory,
        token_0_symbol      = aggregator_pair_first,
        token_1_symbol      = aggregator_pair_second
    )
    if aggregator:    
        aggregator.factory          = None
        await aggregator.save()
