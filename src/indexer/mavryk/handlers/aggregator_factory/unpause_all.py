from mavryk.utils.error_reporting import save_error_report

from mavryk.types.aggregator_factory.tezos_parameters.unpause_all import UnpauseAllParameter
from dipdup.models.tezos_tzkt import TzktTransaction
from mavryk.types.aggregator_factory.tezos_storage import AggregatorFactoryStorage
from dipdup.context import HandlerContext
import mavryk.models as models

async def unpause_all(
    ctx: HandlerContext,
    unpause_all: TzktTransaction[UnpauseAllParameter, AggregatorFactoryStorage],
) -> None:

    try:
        # Get operation info
        aggregator_factory_address                          = unpause_all.data.target_address
        create_aggregator_paused                            = unpause_all.storage.breakGlassConfig.createAggregatorIsPaused
        track_aggregator_paused                             = unpause_all.storage.breakGlassConfig.trackAggregatorIsPaused
        untrack_aggregator_paused                           = unpause_all.storage.breakGlassConfig.untrackAggregatorIsPaused
        distribute_reward_xtz_paused                        = unpause_all.storage.breakGlassConfig.distributeRewardXtzIsPaused
        distribute_reward_smvk_paused                       = unpause_all.storage.breakGlassConfig.distributeRewardStakedMvkIsPaused
    
        # Update record
        await models.AggregatorFactory.filter(network=ctx.datasource.network,address    = aggregator_factory_address).update(
            create_aggregator_paused         = create_aggregator_paused,
            track_aggregator_paused          = track_aggregator_paused,
            untrack_aggregator_paused        = untrack_aggregator_paused,
            distribute_reward_xtz_paused     = distribute_reward_xtz_paused,
            distribute_reward_smvk_paused    = distribute_reward_smvk_paused
        )

    except BaseException as e:
        await save_error_report(e)

