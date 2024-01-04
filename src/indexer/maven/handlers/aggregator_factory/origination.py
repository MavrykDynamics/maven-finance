from maven.utils.contracts import get_contract_metadata
from maven.utils.error_reporting import save_error_report

from dipdup.models.tezos_tzkt import TzktOrigination
from maven.types.aggregator_factory.tezos_storage import AggregatorFactoryStorage
from dipdup.context import HandlerContext
import maven.models as models

async def origination(
    ctx: HandlerContext,
    aggregator_factory_origination: TzktOrigination[AggregatorFactoryStorage],
) -> None:

    try:
        # Get operation info
        aggregator_factory_address      = aggregator_factory_origination.data.originated_contract_address
        admin                           = aggregator_factory_origination.storage.admin
        create_aggregator_paused        = aggregator_factory_origination.storage.breakGlassConfig.createAggregatorIsPaused
        track_aggregator_paused         = aggregator_factory_origination.storage.breakGlassConfig.trackAggregatorIsPaused
        untrack_aggregator_paused       = aggregator_factory_origination.storage.breakGlassConfig.untrackAggregatorIsPaused
        distribute_reward_xtz_paused    = aggregator_factory_origination.storage.breakGlassConfig.distributeRewardXtzIsPaused
        distribute_reward_smvn_paused   = aggregator_factory_origination.storage.breakGlassConfig.distributeRewardStakedMvnIsPaused
    
        # Get contract metadata
        contract_metadata = await get_contract_metadata(
            ctx=ctx,
            contract_address=aggregator_factory_address
        )
    
        # Get governance record
        governance                  = await models.Governance.get(network = ctx.datasource.name.replace('tzkt_',''))
    
        # Create record
        aggregator_factory          = models.AggregatorFactory(
            address                         = aggregator_factory_address,
            network                         = ctx.datasource.name.replace('tzkt_',''),
            metadata                        = contract_metadata,
            admin                           = admin,
            governance                      = governance,
            create_aggregator_paused        = create_aggregator_paused,
            track_aggregator_paused         = track_aggregator_paused,
            untrack_aggregator_paused       = untrack_aggregator_paused,
            distribute_reward_xtz_paused    = distribute_reward_xtz_paused,
            distribute_reward_smvn_paused   = distribute_reward_smvn_paused
        )
        await aggregator_factory.save()

    except BaseException as e:
        await save_error_report(e)

