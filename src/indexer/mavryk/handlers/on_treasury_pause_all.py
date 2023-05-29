from mavryk.utils.error_reporting import save_error_report

from dipdup.context import HandlerContext
from mavryk.types.treasury.parameter.pause_all import PauseAllParameter
from dipdup.models import Transaction
from mavryk.types.treasury.storage import TreasuryStorage
import mavryk.models as models

async def on_treasury_pause_all(
    ctx: HandlerContext,
    pause_all: Transaction[PauseAllParameter, TreasuryStorage],
) -> None:

    try:
        # Get operation info
        treasury_address    = pause_all.data.target_address
        treasury            = await models.Treasury.get(network=ctx.datasource.network, address=treasury_address)
    
        # Update record
        treasury.transfer_paused                = pause_all.storage.breakGlassConfig.transferIsPaused
        treasury.mint_mvk_and_transfer_paused   = pause_all.storage.breakGlassConfig.mintMvkAndTransferIsPaused
        treasury.stake_mvk_paused               = pause_all.storage.breakGlassConfig.stakeMvkIsPaused
        treasury.unstake_mvk_paused             = pause_all.storage.breakGlassConfig.unstakeMvkIsPaused
        await treasury.save()

    except BaseException as e:
         await save_error_report(e)

