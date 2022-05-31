
from dipdup.context import HandlerContext
from mavryk.types.farm.storage import FarmStorage
from mavryk.types.farm.parameter.toggle_pause_withdraw import TogglePauseWithdrawParameter
from dipdup.models import Transaction
import mavryk.models as models

async def on_farm_toggle_pause_withdraw(
    ctx: HandlerContext,
    toggle_pause_withdraw: Transaction[TogglePauseWithdrawParameter, FarmStorage],
) -> None:

    # Get operation info
    farm_address    = toggle_pause_withdraw.data.target_address
    farm            = await models.Farm.get(address=farm_address)

    # Update record
    farm.deposit_paused     = toggle_pause_withdraw.storage.breakGlassConfig.depositIsPaused
    farm.withdraw_paused    = toggle_pause_withdraw.storage.breakGlassConfig.withdrawIsPaused
    farm.claim_paused       = toggle_pause_withdraw.storage.breakGlassConfig.claimIsPaused
    await farm.save()
