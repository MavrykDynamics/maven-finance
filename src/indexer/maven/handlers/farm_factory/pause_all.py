from maven.utils.error_reporting import save_error_report

from dipdup.context import HandlerContext
from maven.types.farm_factory.tezos_parameters.pause_all import PauseAllParameter
from maven.types.farm_factory.tezos_storage import FarmFactoryStorage
from dipdup.models.tezos import TezosTransaction
from maven import models as models

async def pause_all(
    ctx: HandlerContext,
    pause_all: TezosTransaction[PauseAllParameter, FarmFactoryStorage],
) -> None:

    try:
        # Get operation info
        farm_factory_address    = pause_all.data.target_address
    
        # Update record
        await models.FarmFactory.filter(network='atlasnet', address=farm_factory_address).update(
            create_farm_paused         = pause_all.storage.breakGlassConfig.createFarmIsPaused,
            create_farm_m_token_paused = pause_all.storage.breakGlassConfig.createFarmMTokenIsPaused,
            track_farm_paused          = pause_all.storage.breakGlassConfig.trackFarmIsPaused,
            untrack_farm_paused        = pause_all.storage.breakGlassConfig.untrackFarmIsPaused
        )

    except BaseException as e:
        await save_error_report(e)

