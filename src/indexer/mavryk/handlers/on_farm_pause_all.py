from mavryk.utils.error_reporting import save_error_report

from dipdup.context import HandlerContext
from mavryk.types.farm.parameter.pause_all import PauseAllParameter
from mavryk.types.farm.storage import FarmStorage
from dipdup.models import Transaction
import mavryk.models as models

async def on_farm_pause_all(
    ctx: HandlerContext,
    pause_all: Transaction[PauseAllParameter, FarmStorage],
) -> None:

    try:
        # Get operation info
        farm_address    = pause_all.data.target_address
        farm            = await models.Farm.get(address=farm_address)
    
        # Update record
        farm.deposit_paused     = pause_all.storage.breakGlassConfig.depositIsPaused
        farm.withdraw_paused    = pause_all.storage.breakGlassConfig.withdrawIsPaused
        farm.claim_paused       = pause_all.storage.breakGlassConfig.claimIsPaused
        await farm.save()

    except BaseException:
         await save_error_report()

