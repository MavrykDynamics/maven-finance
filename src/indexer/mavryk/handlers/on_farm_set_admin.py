
from dipdup.context import HandlerContext
from mavryk.types.farm.storage import FarmStorage
from dipdup.models import Transaction
from mavryk.types.farm.parameter.set_admin import SetAdminParameter

async def on_farm_set_admin(
    ctx: HandlerContext,
    set_admin: Transaction[SetAdminParameter, FarmStorage],
) -> None:
    ...