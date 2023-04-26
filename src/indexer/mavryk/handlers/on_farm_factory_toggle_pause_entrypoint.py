from mavryk.utils.error_reporting import save_error_report

from mavryk.types.farm_factory.parameter.toggle_pause_entrypoint import TogglePauseEntrypointParameter
from dipdup.models import Transaction
from mavryk.types.farm_factory.storage import FarmFactoryStorage
from dipdup.context import HandlerContext
import mavryk.models as models

async def on_farm_factory_toggle_pause_entrypoint(
    ctx: HandlerContext,
    toggle_pause_entrypoint: Transaction[TogglePauseEntrypointParameter, FarmFactoryStorage],
) -> None:

    try:
        # Get operation info
        farm_factory_address    = toggle_pause_entrypoint.data.target_address
        farm_factory            = await models.FarmFactory.get(address=farm_factory_address)
    
        # Update record
        farm_factory.create_farm_paused         = toggle_pause_entrypoint.storage.breakGlassConfig.createFarmIsPaused
        farm_factory.create_farm_m_token_paused = toggle_pause_entrypoint.storage.breakGlassConfig.createFarmMTokenIsPaused
        farm_factory.track_farm_paused          = toggle_pause_entrypoint.storage.breakGlassConfig.trackFarmIsPaused
        farm_factory.untrack_farm_paused        = toggle_pause_entrypoint.storage.breakGlassConfig.untrackFarmIsPaused
        await farm_factory.save()
    except BaseException:
         await save_error_report()

