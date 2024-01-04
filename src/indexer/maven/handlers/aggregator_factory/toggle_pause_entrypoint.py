from maven.utils.error_reporting import save_error_report

from maven.types.aggregator_factory.tezos_storage import AggregatorFactoryStorage
from maven.types.aggregator_factory.tezos_parameters.toggle_pause_entrypoint import TogglePauseEntrypointParameter
from dipdup.models.tezos_tzkt import TzktTransaction
from dipdup.context import HandlerContext
import maven.models as models

async def toggle_pause_entrypoint(
    ctx: HandlerContext,
    toggle_pause_entrypoint: TzktTransaction[TogglePauseEntrypointParameter, AggregatorFactoryStorage],
) -> None:

    try:
        # Get operation info
        aggregator_factory_address                          = toggle_pause_entrypoint.data.target_address
        create_aggregator_paused                            = toggle_pause_entrypoint.storage.breakGlassConfig.createAggregatorIsPaused
        track_aggregator_paused                             = toggle_pause_entrypoint.storage.breakGlassConfig.trackAggregatorIsPaused
        untrack_aggregator_paused                           = toggle_pause_entrypoint.storage.breakGlassConfig.untrackAggregatorIsPaused
        distribute_reward_xtz_paused                        = toggle_pause_entrypoint.storage.breakGlassConfig.distributeRewardXtzIsPaused
        distribute_reward_smvn_paused                       = toggle_pause_entrypoint.storage.breakGlassConfig.distributeRewardStakedMvnIsPaused
    
        # Update record
        await models.AggregatorFactory.get(network=ctx.datasource.name.replace('tzkt_',''), address    = aggregator_factory_address).update(
            create_aggregator_paused         = create_aggregator_paused,
            track_aggregator_paused          = track_aggregator_paused,
            untrack_aggregator_paused        = untrack_aggregator_paused,
            distribute_reward_xtz_paused     = distribute_reward_xtz_paused,
            distribute_reward_smvn_paused    = distribute_reward_smvn_paused
        )

    except BaseException as e:
        await save_error_report(e)

