
from mavryk.types.aggregator_factory.parameter.set_admin import SetAdminParameter
from dipdup.models import Transaction
from mavryk.types.aggregator_factory.storage import AggregatorFactoryStorage
from dipdup.context import HandlerContext

async def on_aggregator_factory_set_admin(
    ctx: HandlerContext,
    set_admin: Transaction[SetAdminParameter, AggregatorFactoryStorage],
) -> None:
    ...