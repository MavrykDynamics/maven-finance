
from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.treasury.parameter.toggle_pause_transfer import TogglePauseTransferParameter
from mavryk.types.treasury.storage import TreasuryStorage
import mavryk.models as models

async def on_treasury_toggle_pause_transfer(
    ctx: HandlerContext,
    toggle_pause_transfer: Transaction[TogglePauseTransferParameter, TreasuryStorage],
) -> None:

    # Get operation info
    treasury_address    = toggle_pause_transfer.data.target_address
    treasury            = await models.Treasury.get(address=treasury_address)

    # Update record
    treasury.transfer_paused                = toggle_pause_transfer.storage.breakGlassConfig.transferIsPaused
    treasury.mint_mvk_and_transfer_paused   = toggle_pause_transfer.storage.breakGlassConfig.mintMvkAndTransferIsPaused
    treasury.stake_mvk_paused               = toggle_pause_transfer.storage.breakGlassConfig.stakeMvkIsPaused
    treasury.unstake_mvk_paused             = toggle_pause_transfer.storage.breakGlassConfig.unstakeMvkIsPaused
    await treasury.save()
