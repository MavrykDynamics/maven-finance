
from mavryk.types.treasury_factory.storage import TreasuryFactoryStorage
from dipdup.context import HandlerContext
from mavryk.types.treasury_factory.parameter.create_treasury import CreateTreasuryParameter
from dipdup.models import Transaction

async def on_treasury_factory_create_treasury(
    ctx: HandlerContext,
    create_treasury: Transaction[CreateTreasuryParameter, TreasuryFactoryStorage],
) -> None:
    ...