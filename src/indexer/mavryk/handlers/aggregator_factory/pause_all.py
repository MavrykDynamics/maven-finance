from mavryk.utils.error_reporting import save_error_report

from dipdup.models import Transaction
from mavryk.types.aggregator_factory.storage import AggregatorFactoryStorage
from mavryk.types.aggregator_factory.parameter.pause_all import PauseAllParameter
from dipdup.context import HandlerContext
import mavryk.models as models

async def pause_all(
    ctx: HandlerContext,
    pause_all: Transaction[PauseAllParameter, AggregatorFactoryStorage],
) -> None:

    try:
        # Get operation info
        aggregator_factory_address                          = pause_all.data.target_address
        create_aggregator_paused                            = pause_all.storage.breakGlassConfig.createAggregatorIsPaused
        track_aggregator_paused                             = pause_all.storage.breakGlassConfig.trackAggregatorIsPaused
        untrack_aggregator_paused                           = pause_all.storage.breakGlassConfig.untrackAggregatorIsPaused
        distribute_reward_xtz_paused                        = pause_all.storage.breakGlassConfig.distributeRewardXtzIsPaused
        distribute_reward_smvk_paused                       = pause_all.storage.breakGlassConfig.distributeRewardStakedMvkIsPaused
    
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

