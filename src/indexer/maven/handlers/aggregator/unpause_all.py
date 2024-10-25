from maven.utils.error_reporting import save_error_report

from maven.types.aggregator.tezos_parameters.unpause_all import UnpauseAllParameter
from maven.types.aggregator.tezos_storage import AggregatorStorage
from dipdup.models.tezos_tzkt import TzktTransaction
from dipdup.context import HandlerContext
import maven.models as models

async def unpause_all(
    ctx: HandlerContext,
    unpause_all: TzktTransaction[UnpauseAllParameter, AggregatorStorage],
) -> None:

    try:
        # Get operation info
        aggregator_address                                  = unpause_all.data.target_address
        update_data_paused                                  = unpause_all.storage.breakGlassConfig.updateDataIsPaused
        withdraw_reward_mvrk_paused                         = unpause_all.storage.breakGlassConfig.withdrawRewardMvrkIsPaused
        withdraw_reward_smvn_paused                         = unpause_all.storage.breakGlassConfig.withdrawRewardStakedMvnIsPaused
    
        # Update record
        await models.Aggregator.filter(network=ctx.datasource.name.replace('mvkt_',''), address= aggregator_address).update(
            update_data_paused                       = update_data_paused,
            withdraw_reward_mvrk_paused              = withdraw_reward_mvrk_paused,
            withdraw_reward_smvn_paused              = withdraw_reward_smvn_paused,
        )

    except BaseException as e:
        await save_error_report(e)

