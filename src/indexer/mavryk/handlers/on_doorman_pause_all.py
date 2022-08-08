
from dipdup.models import Transaction
from dipdup.context import HandlerContext
from mavryk.types.doorman.storage import DoormanStorage
from mavryk.types.doorman.parameter.pause_all import PauseAllParameter
import mavryk.models as models

async def on_doorman_pause_all(
    ctx: HandlerContext,
    pause_all: Transaction[PauseAllParameter, DoormanStorage],
) -> None:
    # Get doorman contract
    doorman_address = pause_all.data.target_address
    doorman         = await models.Doorman.get(address=doorman_address)

    # Update doorman
    doorman.stake_paused        = pause_all.storage.breakGlassConfig.stakeIsPaused
    doorman.unstake_paused      = pause_all.storage.breakGlassConfig.unstakeIsPaused
    doorman.compound_paused     = pause_all.storage.breakGlassConfig.compoundIsPaused
    doorman.farm_claim_paused   = pause_all.storage.breakGlassConfig.farmClaimIsPaused
    await doorman.save()
