from mavryk.utils.error_reporting import save_error_report

from mavryk.types.aggregator.tezos_parameters.withdraw_reward_xtz import WithdrawRewardXtzParameter
from mavryk.types.aggregator.tezos_storage import AggregatorStorage
from dipdup.models.tezos_tzkt import TzktTransaction
from dipdup.context import HandlerContext
import mavryk.models as models

async def withdraw_reward_xtz(
    ctx: HandlerContext,
    withdraw_reward_xtz: TzktTransaction[WithdrawRewardXtzParameter, AggregatorStorage],
) -> None:

    try:
        # Get operation info
        aggregator_address          = withdraw_reward_xtz.data.target_address
        oracle_address              = withdraw_reward_xtz.parameter.__root__
        oracle_reward_xtz_storage   = withdraw_reward_xtz.storage.oracleRewardXtz[oracle_address]
    
        # Update record
        user                            = await models.mavryk_user_cache.get(network=ctx.datasource.name.replace('tzkt_',''), address=oracle_address)
        aggregator                      = await models.Aggregator.get(network=ctx.datasource.name.replace('tzkt_',''), address= aggregator_address)
        oracle                          = await models.AggregatorOracle.get(
            aggregator  = aggregator,
            user        = user
        )
        oracle_reward_xtz, _        = await models.AggregatorOracleReward.get_or_create(
            oracle      = oracle,
            type        = models.RewardType.XTZ
        )
        oracle_reward_xtz.xtz       = oracle_reward_xtz_storage
        await oracle_reward_xtz.save()

    except BaseException as e:
        await save_error_report(e)

