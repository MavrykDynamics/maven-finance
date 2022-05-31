
from dipdup.context import HandlerContext
from mavryk.types.treasury.parameter.toggle_pause_stake_mvk import TogglePauseStakeMvkParameter
from mavryk.types.treasury.storage import TreasuryStorage
from dipdup.models import Transaction
import mavryk.models as models

async def on_treasury_toggle_pause_stake_mvk(
    ctx: HandlerContext,
    toggle_pause_stake_mvk: Transaction[TogglePauseStakeMvkParameter, TreasuryStorage],
) -> None:

    # Get operation info
    treasury_address    = toggle_pause_stake_mvk.data.target_address
    treasury            = await models.Treasury.get(address=treasury_address)

    # Update record
    treasury.transfer_paused                = toggle_pause_stake_mvk.storage.breakGlassConfig.transferIsPaused
    treasury.mint_mvk_and_transfer_paused   = toggle_pause_stake_mvk.storage.breakGlassConfig.mintMvkAndTransferIsPaused
    treasury.stake_mvk_paused               = toggle_pause_stake_mvk.storage.breakGlassConfig.stakeMvkIsPaused
    treasury.unstake_mvk_paused             = toggle_pause_stake_mvk.storage.breakGlassConfig.unstakeMvkIsPaused
    await treasury.save()
