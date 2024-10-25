from maven.utils.error_reporting import save_error_report

from maven.types.aggregator.tezos_parameters.pause_all import PauseAllParameter
from dipdup.models.tezos_tzkt import TzktTransaction
from maven.types.aggregator.tezos_storage import AggregatorStorage
from dipdup.context import HandlerContext
import maven.models as models

async def pause_all(
    ctx: HandlerContext,
    pause_all: TzktTransaction[PauseAllParameter, AggregatorStorage],
) -> None:

    try:
        # Get operation info
        aggregator_address                                  = pause_all.data.target_address
        update_data_paused                                  = pause_all.storage.breakGlassConfig.updateDataIsPaused
        withdraw_reward_mvrk_paused                         = pause_all.storage.breakGlassConfig.withdrawRewardMvrkIsPaused
        withdraw_reward_smvn_paused                         = pause_all.storage.breakGlassConfig.withdrawRewardStakedMvnIsPaused
    
        # Update record
        await models.Aggregator.filter(network=ctx.datasource.name.replace('mvkt_',''), address= aggregator_address).update(
            update_data_paused                       = update_data_paused,
            withdraw_reward_mvrk_paused              = withdraw_reward_mvrk_paused,
            withdraw_reward_smvn_paused              = withdraw_reward_smvn_paused,
        )

    except BaseException as e:
        await save_error_report(e)

