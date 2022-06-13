
from dipdup.models import Transaction
from mavryk.types.aggregator_factory.storage import AggregatorFactoryStorage
from mavryk.types.aggregator_factory.parameter.pause_all import PauseAllParameter
from dipdup.context import HandlerContext

async def on_aggregator_factory_pause_all(
    ctx: HandlerContext,
    pause_all: Transaction[PauseAllParameter, AggregatorFactoryStorage],
) -> None:
    ...