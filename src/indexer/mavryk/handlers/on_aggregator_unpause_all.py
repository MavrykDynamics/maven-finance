
from mavryk.types.aggregator.parameter.unpause_all import UnpauseAllParameter
from mavryk.types.aggregator.storage import AggregatorStorage
from dipdup.models import Transaction
from dipdup.context import HandlerContext
import mavryk.models as models

async def on_aggregator_unpause_all(
    ctx: HandlerContext,
    unpause_all: Transaction[UnpauseAllParameter, AggregatorStorage],
) -> None:

    # Get operation info
    aggregator_address                                  = unpause_all.data.target_address
    request_rate_update_paused                          = unpause_all.storage.breakGlassConfig.requestRateUpdateIsPaused
    request_rate_update_deviation_paused                = unpause_all.storage.breakGlassConfig.requestRateUpdateDeviationIsPaused
    set_observation_commit_paused                       = unpause_all.storage.breakGlassConfig.setObservationCommitIsPaused
    set_observation_reveal_paused                       = unpause_all.storage.breakGlassConfig.setObservationRevealIsPaused
    withdraw_reward_xtz_paused                          = unpause_all.storage.breakGlassConfig.withdrawRewardXtzIsPaused
    withdraw_reward_smvk_paused                         = unpause_all.storage.breakGlassConfig.withdrawRewardStakedMvkIsPaused

    # Update record
    aggregator                                          = await models.Aggregator.get(address    = aggregator_address)
    aggregator.request_rate_update_paused               = request_rate_update_paused
    aggregator.request_rate_update_deviation_paused     = request_rate_update_deviation_paused
    aggregator.set_observation_commit_paused            = set_observation_commit_paused
    aggregator.set_observation_reveal_paused            = set_observation_reveal_paused
    aggregator.withdraw_reward_xtz_paused               = withdraw_reward_xtz_paused
    aggregator.withdraw_reward_smvk_paused              = withdraw_reward_smvk_paused
    await aggregator.save()
