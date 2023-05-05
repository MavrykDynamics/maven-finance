from mavryk.utils.error_reporting import save_error_report

from dipdup.models import Origination
from ..utils.persisters import persist_contract_metadata
from mavryk.types.aggregator_factory.storage import AggregatorFactoryStorage
from dipdup.context import HandlerContext
import mavryk.models as models

async def on_aggregator_factory_origination(
    ctx: HandlerContext,
    aggregator_factory_origination: Origination[AggregatorFactoryStorage],
) -> None:

    try:
        # Get operation info
        aggregator_factory_address      = aggregator_factory_origination.data.originated_contract_address
        admin                           = aggregator_factory_origination.storage.admin
        governance_address              = aggregator_factory_origination.storage.governanceAddress
        create_aggregator_paused        = aggregator_factory_origination.storage.breakGlassConfig.createAggregatorIsPaused
        track_aggregator_paused         = aggregator_factory_origination.storage.breakGlassConfig.trackAggregatorIsPaused
        untrack_aggregator_paused       = aggregator_factory_origination.storage.breakGlassConfig.untrackAggregatorIsPaused
        distribute_reward_xtz_paused    = aggregator_factory_origination.storage.breakGlassConfig.distributeRewardXtzIsPaused
        distribute_reward_smvk_paused   = aggregator_factory_origination.storage.breakGlassConfig.distributeRewardStakedMvkIsPaused
    
        # Persist contract metadata
        await persist_contract_metadata(
            ctx=ctx,
            contract_address=aggregator_factory_address
        )
    
        # Get or create governance record
        governance, _                   = await models.Governance.get_or_create(address = governance_address)
        await governance.save();
    
        # Create record
        aggregator_factory          = models.AggregatorFactory(
            address                         = aggregator_factory_address,
            admin                           = admin,
            governance                      = governance,
            create_aggregator_paused        = create_aggregator_paused,
            track_aggregator_paused         = track_aggregator_paused,
            untrack_aggregator_paused       = untrack_aggregator_paused,
            distribute_reward_xtz_paused    = distribute_reward_xtz_paused,
            distribute_reward_smvk_paused   = distribute_reward_smvk_paused
        )
        await aggregator_factory.save()

    except BaseException as e:
         await save_error_report(e)

