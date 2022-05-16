
from dipdup.context import HandlerContext
from mavryk.types.treasury_factory.storage import TreasuryFactoryStorage
from dipdup.models import Origination

async def on_treasury_factory_origination(
    ctx: HandlerContext,
    treasury_factory_origination: Origination[TreasuryFactoryStorage],
) -> None:
    ...