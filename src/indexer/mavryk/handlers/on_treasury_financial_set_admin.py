
from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.treasury.parameter.set_admin import SetAdminParameter
from mavryk.types.treasury.storage import TreasuryStorage

async def on_treasury_financial_set_admin(
    ctx: HandlerContext,
    set_admin: Transaction[SetAdminParameter, TreasuryStorage],
) -> None:
    ...