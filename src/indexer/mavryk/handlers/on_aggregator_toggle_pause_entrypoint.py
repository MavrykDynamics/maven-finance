
from dipdup.models import Transaction
from mavryk.types.aggregator.storage import AggregatorStorage
from dipdup.context import HandlerContext
from mavryk.types.aggregator.parameter.toggle_pause_entrypoint import TogglePauseEntrypointParameter
import mavryk.models as models

async def on_aggregator_toggle_pause_entrypoint(
    ctx: HandlerContext,
    toggle_pause_entrypoint: Transaction[TogglePauseEntrypointParameter, AggregatorStorage],
) -> None:

    # Get operation info
    aggregator_address                                  = toggle_pause_entrypoint.data.target_address
    request_rate_update_paused                          = toggle_pause_entrypoint.storage.breakGlassConfig.requestRateUpdateIsPaused
    request_rate_update_deviation_paused                = toggle_pause_entrypoint.storage.breakGlassConfig.requestRateUpdateDeviationIsPaused
    set_observation_commit_paused                       = toggle_pause_entrypoint.storage.breakGlassConfig.setObservationCommitIsPaused
    set_observation_reveal_paused                       = toggle_pause_entrypoint.storage.breakGlassConfig.setObservationRevealIsPaused
    withdraw_reward_xtz_paused                          = toggle_pause_entrypoint.storage.breakGlassConfig.withdrawRewardXtzIsPaused
    withdraw_reward_smvk_paused                         = toggle_pause_entrypoint.storage.breakGlassConfig.withdrawRewardStakedMvkIsPaused

    # Update record
    aggregator                                          = await models.Aggregator.get(address    = aggregator_address)
    aggregator.request_rate_update_paused               = request_rate_update_paused
    aggregator.request_rate_update_deviation_paused     = request_rate_update_deviation_paused
    aggregator.set_observation_commit_paused            = set_observation_commit_paused
    aggregator.set_observation_reveal_paused            = set_observation_reveal_paused
    aggregator.withdraw_reward_xtz_paused               = withdraw_reward_xtz_paused
    aggregator.withdraw_reward_smvk_paused              = withdraw_reward_smvk_paused
    await aggregator.save()
