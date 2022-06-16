
from mavryk.types.aggregator_factory.parameter.toggle_pause_untrack_aggregator import TogglePauseUntrackAggregatorParameter
from dipdup.models import Transaction
from mavryk.types.aggregator_factory.storage import AggregatorFactoryStorage
from dipdup.context import HandlerContext
import mavryk.models as models

async def on_aggregator_factory_toggle_pause_untrack_aggregator(
    ctx: HandlerContext,
    toggle_pause_untrack_aggregator: Transaction[TogglePauseUntrackAggregatorParameter, AggregatorFactoryStorage],
) -> None:

    # Get operation info
    aggregator_factory_address                          = toggle_pause_untrack_aggregator.data.target_address
    create_aggregator_paused                            = toggle_pause_untrack_aggregator.storage.breakGlassConfig.createAggregatorIsPaused
    track_aggregator_paused                             = toggle_pause_untrack_aggregator.storage.breakGlassConfig.trackAggregatorIsPaused
    untrack_aggregator_paused                           = toggle_pause_untrack_aggregator.storage.breakGlassConfig.untrackAggregatorIsPaused
    distribute_reward_xtz_paused                        = toggle_pause_untrack_aggregator.storage.breakGlassConfig.distributeRewardXtzIsPaused
    distribute_reward_smvk_paused                       = toggle_pause_untrack_aggregator.storage.breakGlassConfig.distributeRewardMvkIsPaused

    # Update record
    aggregator_factory                                  = await models.AggregatorFactory.get(address    = aggregator_factory_address)
    aggregator_factory.create_aggregator_paused         = create_aggregator_paused
    aggregator_factory.track_aggregator_paused          = track_aggregator_paused
    aggregator_factory.untrack_aggregator_paused        = untrack_aggregator_paused
    aggregator_factory.distribute_reward_xtz_paused     = distribute_reward_xtz_paused
    aggregator_factory.distribute_reward_smvk_paused    = distribute_reward_smvk_paused
    await aggregator_factory.save()
