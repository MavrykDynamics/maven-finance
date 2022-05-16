
from dipdup.context import HandlerContext
from dipdup.models import Origination
from mavryk.types.treasury.storage import TreasuryStorage

async def on_treasury_origination(
    ctx: HandlerContext,
    treasury_origination: Origination[TreasuryStorage],
) -> None:
    ...