
from mavryk.types.aggregator.parameter.toggle_pause_set_observation_reveal import TogglePauseSetObservationRevealParameter
from mavryk.types.aggregator.storage import AggregatorStorage
from dipdup.models import Transaction
from dipdup.context import HandlerContext
import mavryk.models as models

async def on_aggregator_toggle_pause_set_observation_reveal(
    ctx: HandlerContext,
    toggle_pause_set_observation_reveal: Transaction[TogglePauseSetObservationRevealParameter, AggregatorStorage],
) -> None:

    # Get operation info
    aggregator_address                                  = toggle_pause_set_observation_reveal.data.target_address
    request_rate_update_paused                          = toggle_pause_set_observation_reveal.storage.breakGlassConfig.requestRateUpdateIsPaused
    request_rate_update_deviation_paused                = toggle_pause_set_observation_reveal.storage.breakGlassConfig.requestRateUpdateDeviationIsPaused
    set_observation_commit_paused                       = toggle_pause_set_observation_reveal.storage.breakGlassConfig.setObservationCommitIsPaused
    set_observation_reveal_paused                       = toggle_pause_set_observation_reveal.storage.breakGlassConfig.setObservationRevealIsPaused
    withdraw_reward_xtz_paused                          = toggle_pause_set_observation_reveal.storage.breakGlassConfig.withdrawRewardXtzIsPaused
    withdraw_reward_smvk_paused                         = toggle_pause_set_observation_reveal.storage.breakGlassConfig.withdrawRewardStakedMvkIsPaused

    # Update record
    aggregator                                          = await models.Aggregator.get(address    = aggregator_address)
    aggregator.request_rate_update_paused               = request_rate_update_paused
    aggregator.request_rate_update_deviation_paused     = request_rate_update_deviation_paused
    aggregator.set_observation_commit_paused            = set_observation_commit_paused
    aggregator.set_observation_reveal_paused            = set_observation_reveal_paused
    aggregator.withdraw_reward_xtz_paused               = withdraw_reward_xtz_paused
    aggregator.withdraw_reward_smvk_paused              = withdraw_reward_smvk_paused
    await aggregator.save()
