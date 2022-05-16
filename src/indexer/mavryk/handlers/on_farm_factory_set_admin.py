
from mavryk.types.farm_factory.storage import FarmFactoryStorage
from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.farm_factory.parameter.set_admin import SetAdminParameter

async def on_farm_factory_set_admin(
    ctx: HandlerContext,
    set_admin: Transaction[SetAdminParameter, FarmFactoryStorage],
) -> None:
    ...