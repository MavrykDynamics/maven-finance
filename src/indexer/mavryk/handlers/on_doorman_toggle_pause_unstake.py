
from dipdup.models import Transaction
from dipdup.context import HandlerContext
from mavryk.types.doorman.parameter.toggle_pause_unstake import TogglePauseUnstakeParameter
from mavryk.types.doorman.storage import DoormanStorage
import mavryk.models as models

async def on_doorman_toggle_pause_unstake(
    ctx: HandlerContext,
    toggle_pause_unstake: Transaction[TogglePauseUnstakeParameter, DoormanStorage],
) -> None:
    # Get doorman contract
    doorman_address = toggle_pause_unstake.data.target_address
    doorman = await models.Doorman.get(address=doorman_address)

    # Update doorman
    doorman.stake_paused = toggle_pause_unstake.data.storage['breakGlassConfig']['stakeIsPaused']
    doorman.unstake_paused = toggle_pause_unstake.data.storage['breakGlassConfig']['unstakeIsPaused']
    doorman.compound_paused = toggle_pause_unstake.data.storage['breakGlassConfig']['compoundIsPaused']
    doorman.farm_claim_paused = toggle_pause_unstake.data.storage['breakGlassConfig']['farmClaimIsPaused']
    await doorman.save()
