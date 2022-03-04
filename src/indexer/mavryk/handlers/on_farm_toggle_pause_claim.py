
from dipdup.context import HandlerContext
from mavryk.types.farm.parameter.toggle_pause_claim import TogglePauseClaimParameter
from mavryk.types.farm.storage import FarmStorage
from dipdup.models import Transaction
import mavryk.models as models

async def on_farm_toggle_pause_claim(
    ctx: HandlerContext,
    toggle_pause_claim: Transaction[TogglePauseClaimParameter, FarmStorage],
) -> None:
     # Get farm contract
    farmAddress = toggle_pause_claim.data.target_address
    farm = await models.Farm.get(address=farmAddress)

    # Update farm
    farm.deposit_paused = toggle_pause_claim.data.storage['breakGlassConfig']['depositIsPaused']
    farm.withdraw_paused = toggle_pause_claim.data.storage['breakGlassConfig']['withdrawIsPaused']
    farm.claim_paused = toggle_pause_claim.data.storage['breakGlassConfig']['claimIsPaused']
    await farm.save()