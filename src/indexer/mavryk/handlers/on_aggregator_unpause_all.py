
from mavryk.types.aggregator.parameter.unpause_all import UnpauseAllParameter
from mavryk.types.aggregator.storage import AggregatorStorage
from dipdup.models import Transaction
from dipdup.context import HandlerContext

async def on_aggregator_unpause_all(
    ctx: HandlerContext,
    unpause_all: Transaction[UnpauseAllParameter, AggregatorStorage],
) -> None:
    ...