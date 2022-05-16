
from dipdup.context import HandlerContext
from mavryk.types.council.parameter.set_admin import SetAdminParameter
from dipdup.models import Transaction
from mavryk.types.council.storage import CouncilStorage

async def on_council_set_admin(
    ctx: HandlerContext,
    set_admin: Transaction[SetAdminParameter, CouncilStorage],
) -> None:
    ...