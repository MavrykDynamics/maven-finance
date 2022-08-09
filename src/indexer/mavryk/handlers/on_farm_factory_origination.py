
from dipdup.models import Origination
from dipdup.context import HandlerContext
from mavryk.types.farm_factory.storage import FarmFactoryStorage
import mavryk.models as models

async def on_farm_factory_origination(
    ctx: HandlerContext,
    farm_factory_origination: Origination[FarmFactoryStorage],
) -> None:

    # Get Factory address
    address                     = farm_factory_origination.data.originated_contract_address
    admin                       = farm_factory_origination.storage.admin
    governance_address          = farm_factory_origination.storage.governanceAddress
    create_farm_paused          = farm_factory_origination.storage.breakGlassConfig.createFarmIsPaused
    track_farm_paused           = farm_factory_origination.storage.breakGlassConfig.trackFarmIsPaused
    untrack_farm_paused         = farm_factory_origination.storage.breakGlassConfig.untrackFarmIsPaused
    
    # Get or create governance record
    governance, _ = await models.Governance.get_or_create(address=governance_address)
    await governance.save();

    # Create farm factory
    farm_factory = models.FarmFactory(
        address                     = address,
        admin                       = admin,
        governance                  = governance,
        track_farm_paused           = track_farm_paused,
        create_farm_paused          = create_farm_paused,
        untrack_farm_paused         = untrack_farm_paused
    )

    await farm_factory.save()