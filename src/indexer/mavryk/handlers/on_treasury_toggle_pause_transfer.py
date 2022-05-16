
from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.treasury.parameter.toggle_pause_transfer import TogglePauseTransferParameter
from mavryk.types.treasury.storage import TreasuryStorage

async def on_treasury_toggle_pause_transfer(
    ctx: HandlerContext,
    toggle_pause_transfer: Transaction[TogglePauseTransferParameter, TreasuryStorage],
) -> None:
    ...