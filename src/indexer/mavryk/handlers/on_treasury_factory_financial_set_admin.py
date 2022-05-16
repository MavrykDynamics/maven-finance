
from mavryk.types.treasury_factory.parameter.set_admin import SetAdminParameter
from mavryk.types.treasury_factory.storage import TreasuryFactoryStorage
from dipdup.context import HandlerContext
from dipdup.models import Transaction

async def on_treasury_factory_financial_set_admin(
    ctx: HandlerContext,
    set_admin: Transaction[SetAdminParameter, TreasuryFactoryStorage],
) -> None:
    ...