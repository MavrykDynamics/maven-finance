
from mavryk.types.aggregator.parameter.update_config import UpdateConfigParameter
from mavryk.types.aggregator.storage import AggregatorStorage
from dipdup.models import Transaction
from dipdup.context import HandlerContext

async def on_aggregator_update_config(
    ctx: HandlerContext,
    update_config: Transaction[UpdateConfigParameter, AggregatorStorage],
) -> None:
    ...