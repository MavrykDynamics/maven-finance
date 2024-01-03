from maven.utils.error_reporting import save_error_report

from dipdup.models.tezos_tzkt import TzktTransaction
from maven.types.aggregator.tezos_storage import AggregatorStorage
from dipdup.context import HandlerContext
from maven.types.aggregator.tezos_parameters.toggle_pause_entrypoint import TogglePauseEntrypointParameter
import maven.models as models

async def toggle_pause_entrypoint(
    ctx: HandlerContext,
    toggle_pause_entrypoint: TzktTransaction[TogglePauseEntrypointParameter, AggregatorStorage],
) -> None:

    try:
        # Get operation info
        aggregator_address                                  = toggle_pause_entrypoint.data.target_address
        update_data_paused                                  = toggle_pause_entrypoint.storage.breakGlassConfig.updateDataIsPaused
        withdraw_reward_xtz_paused                          = toggle_pause_entrypoint.storage.breakGlassConfig.withdrawRewardXtzIsPaused
        withdraw_reward_smvn_paused                         = toggle_pause_entrypoint.storage.breakGlassConfig.withdrawRewardStakedMvnIsPaused
    
        # Update record
        await models.Aggregator.filter(network=ctx.datasource.name.replace('tzkt_',''), address= aggregator_address).update(
            update_data_paused                       = update_data_paused,
            withdraw_reward_xtz_paused               = withdraw_reward_xtz_paused,
            withdraw_reward_smvn_paused              = withdraw_reward_smvn_paused
        )

    except BaseException as e:
        await save_error_report(e)

