
from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.treasury.parameter.mint_mvk_and_transfer import MintMvkAndTransferParameter
from mavryk.types.treasury.storage import TreasuryStorage

async def on_treasury_mint_mvk_and_transfer(
    ctx: HandlerContext,
    mint_mvk_and_transfer: Transaction[MintMvkAndTransferParameter, TreasuryStorage],
) -> None:
    ...