
from dipdup.context import HandlerContext
from mavryk.types.treasury.parameter.transfer import TransferParameter
from dipdup.models import Transaction
from mavryk.types.treasury.storage import TreasuryStorage

async def on_treasury_transfer(
    ctx: HandlerContext,
    transfer: Transaction[TransferParameter, TreasuryStorage],
) -> None:
    ...