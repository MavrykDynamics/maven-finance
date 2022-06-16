
from mavryk.types.aggregator.parameter.pause_all import PauseAllParameter
from dipdup.models import Transaction
from mavryk.types.aggregator.storage import AggregatorStorage
from dipdup.context import HandlerContext
import mavryk.models as models

async def on_aggregator_pause_all(
    ctx: HandlerContext,
    pause_all: Transaction[PauseAllParameter, AggregatorStorage],
) -> None:

    # Get operation info
    aggregator_address                                  = pause_all.data.target_address
    request_rate_update_paused                          = pause_all.storage.breakGlassConfig.requestRateUpdateIsPaused
    request_rate_update_deviation_paused                = pause_all.storage.breakGlassConfig.requestRateUpdateDeviationIsPaused
    set_observation_commit_paused                       = pause_all.storage.breakGlassConfig.setObservationCommitIsPaused
    set_observation_reveal_paused                       = pause_all.storage.breakGlassConfig.setObservationRevealIsPaused
    withdraw_reward_xtz_paused                          = pause_all.storage.breakGlassConfig.withdrawRewardXtzIsPaused
    withdraw_reward_smvk_paused                         = pause_all.storage.breakGlassConfig.withdrawRewardStakedMvkIsPaused

    # Update record
    aggregator                                          = await models.Aggregator.get(address    = aggregator_address)
    aggregator.request_rate_update_paused               = request_rate_update_paused
    aggregator.request_rate_update_deviation_paused     = request_rate_update_deviation_paused
    aggregator.set_observation_commit_paused            = set_observation_commit_paused
    aggregator.set_observation_reveal_paused            = set_observation_reveal_paused
    aggregator.withdraw_reward_xtz_paused               = withdraw_reward_xtz_paused
    aggregator.withdraw_reward_smvk_paused              = withdraw_reward_smvk_paused
    await aggregator.save()
