from maven.utils.error_reporting import save_error_report

from dipdup.models.tezos_tzkt import TzktTransaction
from maven.types.aggregator_factory.tezos_storage import AggregatorFactoryStorage
from maven.types.aggregator_factory.tezos_parameters.untrack_aggregator import UntrackAggregatorParameter
from dipdup.context import HandlerContext
import maven.models as models

async def untrack_aggregator(
    ctx: HandlerContext,
    untrack_aggregator: TzktTransaction[UntrackAggregatorParameter, AggregatorFactoryStorage],
) -> None:

    try:
        # Get operation info
        aggregator_factory_address  = untrack_aggregator.data.target_address
        aggregator_address          = untrack_aggregator.parameter.__root__
    
        # Update record
        aggregator_factory          = await models.AggregatorFactory.get(
            network             = ctx.datasource.name.replace('tzkt_',''),
            address             = aggregator_factory_address
        )
        aggregator                  = await models.Aggregator.get(
            network             = ctx.datasource.name.replace('tzkt_',''),
            factory             = aggregator_factory,
            address             = aggregator_address
        )
        aggregator.factory          = None
        await aggregator.save()

    except BaseException as e:
        await save_error_report(e)

