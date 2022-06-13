
from mavryk.types.aggregator_factory.parameter.create_aggregator import CreateAggregatorParameter
from dipdup.models import Transaction
from mavryk.types.aggregator_factory.storage import AggregatorFactoryStorage
from dipdup.context import HandlerContext

async def on_aggregator_factory_create_aggregator(
    ctx: HandlerContext,
    create_aggregator: Transaction[CreateAggregatorParameter, AggregatorFactoryStorage],
) -> None:
    ...