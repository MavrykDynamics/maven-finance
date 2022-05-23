
from dipdup.models import Transaction
from dipdup.context import HandlerContext
from mavryk.types.doorman.parameter.toggle_pause_compound import TogglePauseCompoundParameter
from mavryk.types.doorman.storage import DoormanStorage
import mavryk.models as models

async def on_doorman_toggle_pause_compound(
    ctx: HandlerContext,
    toggle_pause_compound: Transaction[TogglePauseCompoundParameter, DoormanStorage],
) -> None:
    # Get doorman contract
    doorman_address = toggle_pause_compound.data.target_address
    doorman         = await models.Doorman.get(address=doorman_address)

    # Update doorman
    doorman.stake_paused        = toggle_pause_compound.storage.breakGlassConfig.stakeIsPaused
    doorman.unstake_paused      = toggle_pause_compound.storage.breakGlassConfig.unstakeIsPaused
    doorman.compound_paused     = toggle_pause_compound.storage.breakGlassConfig.compoundIsPaused
    doorman.farm_claim_paused   = toggle_pause_compound.storage.breakGlassConfig.farmClaimIsPaused
    await doorman.save()
