
from mavryk.types.treasury_factory.storage import TreasuryFactoryStorage
from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.treasury_factory.parameter.unpause_all import UnpauseAllParameter

async def on_treasury_factory_unpause_all(
    ctx: HandlerContext,
    unpause_all: Transaction[UnpauseAllParameter, TreasuryFactoryStorage],
) -> None:
    ...