
from mavryk.types.treasury.parameter.toggle_pause_mint_mvk_and_transfer import TogglePauseMintMvkAndTransferParameter
from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.treasury.storage import TreasuryStorage

async def on_treasury_toggle_pause_mint_mvk_and_transfer(
    ctx: HandlerContext,
    toggle_pause_mint_mvk_and_transfer: Transaction[TogglePauseMintMvkAndTransferParameter, TreasuryStorage],
) -> None:
    ...