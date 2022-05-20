
from mavryk.types.doorman.parameter.toggle_pause_farm_claim import TogglePauseFarmClaimParameter
from mavryk.types.doorman.storage import DoormanStorage
from dipdup.models import Transaction
from dipdup.context import HandlerContext
import mavryk.models as models

async def on_doorman_toggle_pause_farm_claim(
    ctx: HandlerContext,
    toggle_pause_farm_claim: Transaction[TogglePauseFarmClaimParameter, DoormanStorage],
) -> None:
    # Get doorman contract
    doorman_address = toggle_pause_farm_claim.data.target_address
    doorman = await models.Doorman.get(address=doorman_address)

    # Update doorman
    doorman.stake_paused = toggle_pause_farm_claim.data.storage['breakGlassConfig']['stakeIsPaused']
    doorman.unstake_paused = toggle_pause_farm_claim.data.storage['breakGlassConfig']['unstakeIsPaused']
    doorman.compound_paused = toggle_pause_farm_claim.data.storage['breakGlassConfig']['compoundIsPaused']
    doorman.farm_claim_paused = toggle_pause_farm_claim.data.storage['breakGlassConfig']['farmClaimIsPaused']
    await doorman.save()