
from dipdup.context import HandlerContext
from mavryk.types.farm.parameter.toggle_pause_deposit import TogglePauseDepositParameter
from mavryk.types.farm.storage import FarmStorage
from dipdup.models import Transaction
import mavryk.models as models

async def on_farm_toggle_pause_deposit(
    ctx: HandlerContext,
    toggle_pause_deposit: Transaction[TogglePauseDepositParameter, FarmStorage],
) -> None:

    # Get operation info
    farm_address    = toggle_pause_deposit.data.target_address
    farm            = await models.Farm.get(address=farm_address)

    # Update record
    farm.deposit_paused     = toggle_pause_deposit.storage.breakGlassConfig.depositIsPaused
    farm.withdraw_paused    = toggle_pause_deposit.storage.breakGlassConfig.withdrawIsPaused
    farm.claim_paused       = toggle_pause_deposit.storage.breakGlassConfig.claimIsPaused
    await farm.save()
