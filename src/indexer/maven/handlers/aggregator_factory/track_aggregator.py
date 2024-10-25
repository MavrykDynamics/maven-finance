from maven.utils.error_reporting import save_error_report

from dipdup.models.tezos_tzkt import TzktTransaction
from maven.types.aggregator_factory.tezos_parameters.track_aggregator import TrackAggregatorParameter
from maven.types.aggregator_factory.tezos_storage import AggregatorFactoryStorage
from dipdup.context import HandlerContext
import maven.models as models

async def track_aggregator(
    ctx: HandlerContext,
    track_aggregator: TzktTransaction[TrackAggregatorParameter, AggregatorFactoryStorage],
) -> None:

    try:
        # Get operation info
        aggregator_factory_address  = track_aggregator.data.target_address
        aggregator_address          = track_aggregator.parameter.__root__
    
        # Update record
        aggregator_factory  = await models.AggregatorFactory.get(
            network=ctx.datasource.name.replace('mvkt_',''), address = aggregator_factory_address
        )
        await models.Aggregator.filter(
            network=ctx.datasource.name.replace('mvkt_',''), address = aggregator_address
        ).update(
            factory = aggregator_factory
        )

    except BaseException as e:
        await save_error_report(e)

