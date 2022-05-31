
from mavryk.types.treasury.parameter.unpause_all import UnpauseAllParameter
from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.treasury.storage import TreasuryStorage
import mavryk.models as models

async def on_treasury_unpause_all(
    ctx: HandlerContext,
    unpause_all: Transaction[UnpauseAllParameter, TreasuryStorage],
) -> None:

    # Get operation info
    treasury_address    = unpause_all.data.target_address
    treasury            = await models.Treasury.get(address=treasury_address)

    # Update record
    treasury.transfer_paused                = unpause_all.storage.breakGlassConfig.transferIsPaused
    treasury.mint_mvk_and_transfer_paused   = unpause_all.storage.breakGlassConfig.mintMvkAndTransferIsPaused
    treasury.stake_mvk_paused               = unpause_all.storage.breakGlassConfig.stakeMvkIsPaused
    treasury.unstake_mvk_paused             = unpause_all.storage.breakGlassConfig.unstakeMvkIsPaused
    await treasury.save()
