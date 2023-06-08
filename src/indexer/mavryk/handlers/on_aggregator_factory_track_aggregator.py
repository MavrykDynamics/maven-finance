from mavryk.utils.error_reporting import save_error_report

from dipdup.models import Transaction
from mavryk.types.aggregator_factory.parameter.track_aggregator import TrackAggregatorParameter
from mavryk.types.aggregator_factory.storage import AggregatorFactoryStorage
from dipdup.context import HandlerContext
import mavryk.models as models

async def on_aggregator_factory_track_aggregator(
    ctx: HandlerContext,
    track_aggregator: Transaction[TrackAggregatorParameter, AggregatorFactoryStorage],
) -> None:

    try:
        # Get operation info
        aggregator_factory_address  = track_aggregator.data.target_address
        aggregator_address          = track_aggregator.parameter.__root__
    
        # Update record
        aggregator_factory  = await models.AggregatorFactory.get(
            network=ctx.datasource.network, address = aggregator_factory_address
        )
        await models.Aggregator.filter(
            network=ctx.datasource.network, address = aggregator_address
        ).update(
            factory = aggregator_factory
        )

    except BaseException as e:
         await save_error_report(e)

