
from mavryk.types.mvk.parameter.set_admin import SetAdminParameter
from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.mvk.storage import MvkStorage

async def on_mvk_set_admin(
    ctx: HandlerContext,
    set_admin: Transaction[SetAdminParameter, MvkStorage],
) -> None:
    ...