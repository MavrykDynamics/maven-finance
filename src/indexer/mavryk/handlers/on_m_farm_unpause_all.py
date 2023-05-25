from mavryk.utils.error_reporting import save_error_report
from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.m_farm.parameter.unpause_all import UnpauseAllParameter
from mavryk.types.m_farm.storage import MFarmStorage
import mavryk.models as models

async def on_m_farm_unpause_all(
    ctx: HandlerContext,
    unpause_all: Transaction[UnpauseAllParameter, MFarmStorage],
) -> None:

    try:
        # Get operation info
        farm_address    = unpause_all.data.target_address
        farm            = await models.Farm.get(network=ctx.datasource.network, address=farm_address)
    
        # Update record
        farm.deposit_paused     = unpause_all.storage.breakGlassConfig.depositIsPaused
        farm.withdraw_paused    = unpause_all.storage.breakGlassConfig.withdrawIsPaused
        farm.claim_paused       = unpause_all.storage.breakGlassConfig.claimIsPaused
        await farm.save()

    except BaseException as e:
         await save_error_report(e)

