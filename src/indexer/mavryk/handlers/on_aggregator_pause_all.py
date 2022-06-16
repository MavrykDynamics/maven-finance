
from mavryk.types.aggregator.parameter.pause_all import PauseAllParameter
from dipdup.models import Transaction
from mavryk.types.aggregator.storage import AggregatorStorage
from dipdup.context import HandlerContext

async def on_aggregator_pause_all(
    ctx: HandlerContext,
    pause_all: Transaction[PauseAllParameter, AggregatorStorage],
) -> None:
    ...