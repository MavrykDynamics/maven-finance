from maven.utils.error_reporting import save_error_report

from maven.types.farm_factory.tezos_parameters.toggle_pause_entrypoint import TogglePauseEntrypointParameter
from dipdup.models.tezos import TezosTransaction
from maven.types.farm_factory.tezos_storage import FarmFactoryStorage
from dipdup.context import HandlerContext
import maven.models as models

async def toggle_pause_entrypoint(
    ctx: HandlerContext,
    toggle_pause_entrypoint: TezosTransaction[TogglePauseEntrypointParameter, FarmFactoryStorage],
) -> None:

    try:
        # Get operation info
        farm_factory_address    = toggle_pause_entrypoint.data.target_address
    
        # Update record
        await models.FarmFactory.filter(network='atlasnet', address=farm_factory_address).update(
            create_farm_paused         = toggle_pause_entrypoint.storage.breakGlassConfig.createFarmIsPaused,
            create_farm_m_token_paused = toggle_pause_entrypoint.storage.breakGlassConfig.createFarmMTokenIsPaused,
            track_farm_paused          = toggle_pause_entrypoint.storage.breakGlassConfig.trackFarmIsPaused,
            untrack_farm_paused        = toggle_pause_entrypoint.storage.breakGlassConfig.untrackFarmIsPaused
        )

    except BaseException as e:
        await save_error_report(e)

