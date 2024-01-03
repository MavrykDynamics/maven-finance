from maven.utils.error_reporting import save_error_report
from dipdup.context import HandlerContext
from dipdup.models.tezos_tzkt import TzktTransaction
from maven.types.m_farm.tezos_parameters.pause_all import PauseAllParameter
from maven.types.m_farm.tezos_storage import MFarmStorage
import maven.models as models

async def pause_all(
    ctx: HandlerContext,
    pause_all: TzktTransaction[PauseAllParameter, MFarmStorage],
) -> None:

    try:
        # Get operation info
        farm_address    = pause_all.data.target_address
    
        # Update record
        await models.Farm.filter(network=ctx.datasource.name.replace('tzkt_',''), address=farm_address).update(
            deposit_paused     = pause_all.storage.breakGlassConfig.depositIsPaused,
            withdraw_paused    = pause_all.storage.breakGlassConfig.withdrawIsPaused,
            claim_paused       = pause_all.storage.breakGlassConfig.claimIsPaused
        )

    except BaseException as e:
        await save_error_report(e)

