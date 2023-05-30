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
    
        # Update record
        await models.Farm.filter(network=ctx.datasource.network, address=farm_address).update(
            deposit_paused     = pause_all.storage.breakGlassConfig.depositIsPaused,
            withdraw_paused    = pause_all.storage.breakGlassConfig.withdrawIsPaused,
            claim_paused       = pause_all.storage.breakGlassConfig.claimIsPaused
        )

    except BaseException as e:
         await save_error_report(e)

