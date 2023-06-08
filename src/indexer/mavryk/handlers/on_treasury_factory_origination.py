from mavryk.utils.error_reporting import save_error_report

from dipdup.context import HandlerContext
from mavryk.utils.contracts import get_contract_metadata
from mavryk.types.treasury_factory.storage import TreasuryFactoryStorage
from dipdup.models import Origination
import mavryk.models as models

async def on_treasury_factory_origination(
    ctx: HandlerContext,
    treasury_factory_origination: Origination[TreasuryFactoryStorage],
) -> None:

    try:
        # Get operation values
        address                         = treasury_factory_origination.data.originated_contract_address
        admin                           = treasury_factory_origination.storage.admin
        create_treasury_paused          = treasury_factory_origination.storage.breakGlassConfig.createTreasuryIsPaused
        track_treasury_paused           = treasury_factory_origination.storage.breakGlassConfig.trackTreasuryIsPaused
        untrack_treasury_paused         = treasury_factory_origination.storage.breakGlassConfig.untrackTreasuryIsPaused
        timestamp                       = treasury_factory_origination.data.timestamp
    
        # Get contract metadata
        contract_metadata = await get_contract_metadata(
            ctx=ctx,
            contract_address=address
        )
        
        # Get governance record
        governance                  = await models.Governance.get(network = ctx.datasource.network)
    
        # Create record
        treasury_factory = models.TreasuryFactory(
            address                         = address,
            network                         = ctx.datasource.network,
            metadata                        = contract_metadata,
            admin                           = admin,
            last_updated_at                 = timestamp,
            governance                      = governance,
            create_treasury_paused          = create_treasury_paused,
            track_treasury_paused           = track_treasury_paused,
            untrack_treasury_paused         = untrack_treasury_paused
        )
        await treasury_factory.save()
    except BaseException as e:
         await save_error_report(e)

