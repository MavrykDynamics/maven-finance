from maven.utils.error_reporting import save_error_report

from maven.types.aggregator_factory.tezos_parameters.unpause_all import UnpauseAllParameter
from dipdup.models.tezos import TezosTransaction
from maven.types.aggregator_factory.tezos_storage import AggregatorFactoryStorage
from dipdup.context import HandlerContext
import maven.models as models

async def unpause_all(
    ctx: HandlerContext,
    unpause_all: TezosTransaction[UnpauseAllParameter, AggregatorFactoryStorage],
) -> None:

    try:
        # Get operation info
        aggregator_factory_address                          = unpause_all.data.target_address
        create_aggregator_paused                            = unpause_all.storage.breakGlassConfig.createAggregatorIsPaused
        track_aggregator_paused                             = unpause_all.storage.breakGlassConfig.trackAggregatorIsPaused
        untrack_aggregator_paused                           = unpause_all.storage.breakGlassConfig.untrackAggregatorIsPaused
        distribute_reward_mvrk_paused                       = unpause_all.storage.breakGlassConfig.distributeRewardMvrkIsPaused
        distribute_reward_smvn_paused                       = unpause_all.storage.breakGlassConfig.distributeRewardStakedMvnIsPaused
    
        # Update record
        await models.AggregatorFactory.filter(network='atlasnet',address    = aggregator_factory_address).update(
            create_aggregator_paused         = create_aggregator_paused,
            track_aggregator_paused          = track_aggregator_paused,
            untrack_aggregator_paused        = untrack_aggregator_paused,
            distribute_reward_mvrk_paused    = distribute_reward_mvrk_paused,
            distribute_reward_smvn_paused    = distribute_reward_smvn_paused
        )

    except BaseException as e:
        await save_error_report(e)

