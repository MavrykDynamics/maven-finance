
from dipdup.context import HandlerContext
from mavryk.types.farm.parameter.toggle_pause_claim import TogglePauseClaimParameter
from mavryk.types.farm.storage import FarmStorage
from dipdup.models import Transaction
import mavryk.models as models

async def on_farm_toggle_pause_claim(
    ctx: HandlerContext,
    toggle_pause_claim: Transaction[TogglePauseClaimParameter, FarmStorage],
) -> None:

    # Get operation info
    farm_address    = toggle_pause_claim.data.target_address
    farm            = await models.Farm.get(address=farm_address)

    # Update record
    farm.deposit_paused     = toggle_pause_claim.storage.breakGlassConfig.depositIsPaused
    farm.withdraw_paused    = toggle_pause_claim.storage.breakGlassConfig.withdrawIsPaused
    farm.claim_paused       = toggle_pause_claim.storage.breakGlassConfig.claimIsPaused
    await farm.save()
