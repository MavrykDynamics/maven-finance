from mavryk.utils.error_reporting import save_error_report

from mavryk.types.treasury.storage import TreasuryStorage
from mavryk.types.treasury.parameter.toggle_pause_entrypoint import TogglePauseEntrypointParameter
from dipdup.models import Transaction
from dipdup.context import HandlerContext
import mavryk.models as models

async def on_treasury_toggle_pause_entrypoint(
    ctx: HandlerContext,
    toggle_pause_entrypoint: Transaction[TogglePauseEntrypointParameter, TreasuryStorage],
) -> None:

    try:
        # Get operation info
        treasury_address    = toggle_pause_entrypoint.data.target_address
        treasury            = await models.Treasury.get(address=treasury_address)
    
        # Update record
        treasury.transfer_paused                = toggle_pause_entrypoint.storage.breakGlassConfig.transferIsPaused
        treasury.mint_mvk_and_transfer_paused   = toggle_pause_entrypoint.storage.breakGlassConfig.mintMvkAndTransferIsPaused
        treasury.stake_mvk_paused               = toggle_pause_entrypoint.storage.breakGlassConfig.stakeMvkIsPaused
        treasury.unstake_mvk_paused             = toggle_pause_entrypoint.storage.breakGlassConfig.unstakeMvkIsPaused
        await treasury.save()
    except BaseException as e:
         await save_error_report(e)

