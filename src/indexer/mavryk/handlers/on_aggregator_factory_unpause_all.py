
from mavryk.types.aggregator_factory.parameter.unpause_all import UnpauseAllParameter
from dipdup.models import Transaction
from mavryk.types.aggregator_factory.storage import AggregatorFactoryStorage
from dipdup.context import HandlerContext

async def on_aggregator_factory_unpause_all(
    ctx: HandlerContext,
    unpause_all: Transaction[UnpauseAllParameter, AggregatorFactoryStorage],
) -> None:
    ...