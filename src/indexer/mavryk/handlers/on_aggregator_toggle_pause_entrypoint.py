from mavryk.utils.error_reporting import save_error_report

from dipdup.models import Transaction
from mavryk.types.aggregator.storage import AggregatorStorage
from dipdup.context import HandlerContext
from mavryk.types.aggregator.parameter.toggle_pause_entrypoint import TogglePauseEntrypointParameter
import mavryk.models as models

async def on_aggregator_toggle_pause_entrypoint(
    ctx: HandlerContext,
    toggle_pause_entrypoint: Transaction[TogglePauseEntrypointParameter, AggregatorStorage],
) -> None:

    try:
        # Get operation info
        aggregator_address                                  = toggle_pause_entrypoint.data.target_address
        update_data_paused                                 = toggle_pause_entrypoint.storage.breakGlassConfig.updateDataIsPaused
        withdraw_reward_xtz_paused                          = toggle_pause_entrypoint.storage.breakGlassConfig.withdrawRewardXtzIsPaused
        withdraw_reward_smvk_paused                         = toggle_pause_entrypoint.storage.breakGlassConfig.withdrawRewardStakedMvkIsPaused
    
        # Update record
        aggregator                                          = await models.Aggregator.get(address    = aggregator_address)
        aggregator.update_data_paused                      = update_data_paused
        aggregator.withdraw_reward_xtz_paused               = withdraw_reward_xtz_paused
        aggregator.withdraw_reward_smvk_paused              = withdraw_reward_smvk_paused
        await aggregator.save()

    except BaseException as e:
         await save_error_report(e)

