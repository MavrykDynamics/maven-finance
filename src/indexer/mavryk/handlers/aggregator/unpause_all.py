from mavryk.utils.error_reporting import save_error_report

from mavryk.types.aggregator.tezos_parameters.unpause_all import UnpauseAllParameter
from mavryk.types.aggregator.tezos_storage import AggregatorStorage
from dipdup.models.tezos_tzkt import TzktTransaction
from dipdup.context import HandlerContext
import mavryk.models as models

async def unpause_all(
    ctx: HandlerContext,
    unpause_all: TzktTransaction[UnpauseAllParameter, AggregatorStorage],
) -> None:

    try:
        # Get operation info
        aggregator_address                                  = unpause_all.data.target_address
        update_data_paused                                 = unpause_all.storage.breakGlassConfig.updateDataIsPaused
        withdraw_reward_xtz_paused                          = unpause_all.storage.breakGlassConfig.withdrawRewardXtzIsPaused
        withdraw_reward_smvk_paused                         = unpause_all.storage.breakGlassConfig.withdrawRewardStakedMvkIsPaused
    
        # Update record
        await models.Aggregator.filter(network=ctx.datasource.network, address= aggregator_address).update(
            update_data_paused                       = update_data_paused,
            withdraw_reward_xtz_paused               = withdraw_reward_xtz_paused,
            withdraw_reward_smvk_paused              = withdraw_reward_smvk_paused,
        )

    except BaseException as e:
        await save_error_report(e)

