from mavryk.utils.error_reporting import save_error_report

from mavryk.types.aggregator.parameter.pause_all import PauseAllParameter
from dipdup.models import Transaction
from mavryk.types.aggregator.storage import AggregatorStorage
from dipdup.context import HandlerContext
import mavryk.models as models

async def on_aggregator_pause_all(
    ctx: HandlerContext,
    pause_all: Transaction[PauseAllParameter, AggregatorStorage],
) -> None:

    try:
        # Get operation info
        aggregator_address                                  = pause_all.data.target_address
        update_data_paused                                 = pause_all.storage.breakGlassConfig.updateDataIsPaused
        withdraw_reward_xtz_paused                          = pause_all.storage.breakGlassConfig.withdrawRewardXtzIsPaused
        withdraw_reward_smvk_paused                         = pause_all.storage.breakGlassConfig.withdrawRewardStakedMvkIsPaused
    
        # Update record
        aggregator                                          = await models.Aggregator.get(network=ctx.datasource.network, address= aggregator_address)
        aggregator.update_data_paused                      = update_data_paused
        aggregator.withdraw_reward_xtz_paused               = withdraw_reward_xtz_paused
        aggregator.withdraw_reward_smvk_paused              = withdraw_reward_smvk_paused
        await aggregator.save()

    except BaseException as e:
         await save_error_report(e)

