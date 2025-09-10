from maven.utils.error_reporting import save_error_report

from dipdup.models.tezos import TezosOrigination
from dipdup.context import HandlerContext
from maven.utils.contracts import get_contract_metadata
from maven.types.farm_factory.tezos_storage import FarmFactoryStorage
from maven import models as models

async def origination(
    ctx: HandlerContext,
    farm_factory_origination: TezosOrigination[FarmFactoryStorage],
) -> None:

    try:
        # Get Factory address
        address                     = farm_factory_origination.data.originated_contract_address
        admin                       = farm_factory_origination.storage.admin
        create_farm_paused          = farm_factory_origination.storage.breakGlassConfig.createFarmIsPaused
        track_farm_paused           = farm_factory_origination.storage.breakGlassConfig.trackFarmIsPaused
        untrack_farm_paused         = farm_factory_origination.storage.breakGlassConfig.untrackFarmIsPaused
        timestamp                   = farm_factory_origination.data.timestamp
    
        # Get contract metadata
        contract_metadata = await get_contract_metadata(
            ctx=ctx,
            contract_address=address
        )
        
        # Get governance record
        governance                  = await models.Governance.get(network = 'atlasnet')
    
        # Create farm factory
        farm_factory = models.FarmFactory(
            address                     = address,
            network                     = 'atlasnet',
            metadata                    = contract_metadata,
            admin                       = admin,
            last_updated_at             = timestamp,
            governance                  = governance,
            track_farm_paused           = track_farm_paused,
            create_farm_paused          = create_farm_paused,
            untrack_farm_paused         = untrack_farm_paused
        )
    
        await farm_factory.save()
    except BaseException as e:
        await save_error_report(e)

