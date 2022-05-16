
from mavryk.types.vesting.storage import VestingStorage
from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.vesting.parameter.set_admin import SetAdminParameter

async def on_vesting_set_admin(
    ctx: HandlerContext,
    set_admin: Transaction[SetAdminParameter, VestingStorage],
) -> None:
    ...