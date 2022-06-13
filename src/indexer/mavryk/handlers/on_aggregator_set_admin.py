
from mavryk.types.aggregator.storage import AggregatorStorage
from dipdup.models import Transaction
from mavryk.types.aggregator.parameter.set_admin import SetAdminParameter
from dipdup.context import HandlerContext

async def on_aggregator_set_admin(
    ctx: HandlerContext,
    set_admin: Transaction[SetAdminParameter, AggregatorStorage],
) -> None:
    ...