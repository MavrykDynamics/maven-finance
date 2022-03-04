
from dipdup.models import Origination
from dipdup.context import HandlerContext
from mavryk.types.farm_factory.storage import FarmFactoryStorage
import mavryk.models as models

async def on_farm_factory_origination(
    ctx: HandlerContext,
    farm_factory_origination: Origination[FarmFactoryStorage],
) -> None:
    # Get Factory address
    farmFactoryAddress = farm_factory_origination.data.originated_contract_address
    create_farm_paused = farm_factory_origination.data.storage['breakGlassConfig']['createFarmIsPaused']
    track_farm_paused = farm_factory_origination.data.storage['breakGlassConfig']['trackFarmIsPaused']
    untrack_farm_paused = farm_factory_origination.data.storage['breakGlassConfig']['untrackFarmIsPaused']
    
    # Create farm factory
    farm_factory = models.FarmFactory(
        address=farmFactoryAddress,
        track_farm_paused=track_farm_paused,
        create_farm_paused=create_farm_paused,
        untrack_farm_paused=untrack_farm_paused
    )

    await farm_factory.save()