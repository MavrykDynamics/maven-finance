from mavryk.utils.error_reporting import save_error_report

from dipdup.models import Transaction
from mavryk.types.aggregator_factory.storage import AggregatorFactoryStorage
from mavryk.types.aggregator_factory.parameter.untrack_aggregator import UntrackAggregatorParameter
from dipdup.context import HandlerContext
import mavryk.models as models

async def on_aggregator_factory_untrack_aggregator(
    ctx: HandlerContext,
    untrack_aggregator: Transaction[UntrackAggregatorParameter, AggregatorFactoryStorage],
) -> None:

    try:
        # Get operation info
        aggregator_factory_address  = untrack_aggregator.data.target_address
        aggregator_address          = untrack_aggregator.parameter.__root__
    
        # Update record
        aggregator_factory          = await models.AggregatorFactory.get(
            network             = ctx.datasource.network,
            address             = aggregator_factory_address
        )
        aggregator                  = await models.Aggregator.get_or_none(
            network             = ctx.datasource.network,
            factory             = aggregator_factory,
            address             = aggregator_address
        )
        if aggregator:    
            aggregator.factory          = None
            await aggregator.save()

    except BaseException as e:
         await save_error_report(e)

