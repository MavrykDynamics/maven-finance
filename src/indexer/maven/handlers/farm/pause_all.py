from maven.utils.error_reporting import save_error_report

from dipdup.context import HandlerContext
from maven.types.farm.tezos_parameters.pause_all import PauseAllParameter
from maven.types.farm.tezos_storage import FarmStorage
from dipdup.models.tezos import TezosTransaction
import maven.models as models

async def pause_all(
    ctx: HandlerContext,
    pause_all: TezosTransaction[PauseAllParameter, FarmStorage],
) -> None:

    try:
        # Get operation info
        farm_address    = pause_all.data.target_address
    
        # Update record
        await models.Farm.filter(network='atlasnet', address=farm_address).update(
            deposit_paused     = pause_all.storage.breakGlassConfig.depositIsPaused,
            withdraw_paused    = pause_all.storage.breakGlassConfig.withdrawIsPaused,
            claim_paused       = pause_all.storage.breakGlassConfig.claimIsPaused
        )

    except BaseException as e:
        await save_error_report(e)

