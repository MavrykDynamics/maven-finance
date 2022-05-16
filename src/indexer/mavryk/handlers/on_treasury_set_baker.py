
from mavryk.types.treasury.parameter.set_baker import SetBakerParameter
from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.treasury.storage import TreasuryStorage

async def on_treasury_set_baker(
    ctx: HandlerContext,
    set_baker: Transaction[SetBakerParameter, TreasuryStorage],
) -> None:
    ...