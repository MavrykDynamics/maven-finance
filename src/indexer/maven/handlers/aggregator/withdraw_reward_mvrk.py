from maven.utils.error_reporting import save_error_report

from maven.types.aggregator.tezos_parameters.withdraw_reward_mvrk import WithdrawRewardMvrkParameter
from maven.types.aggregator.tezos_storage import AggregatorStorage
from dipdup.models.tezos_tzkt import TzktTransaction
from dipdup.context import HandlerContext
import maven.models as models

async def withdraw_reward_mvrk(
    ctx: HandlerContext,
    withdraw_reward_mvrk: TzktTransaction[WithdrawRewardMvrkParameter, AggregatorStorage],
) -> None:

    try:
        # Get operation info
        aggregator_address          = withdraw_reward_mvrk.data.target_address
        oracle_address              = withdraw_reward_mvrk.parameter.__root__
        if oracle_address in withdraw_reward_mvrk.storage.oracleRewardMvrk:
            oracle_reward_mvrk_storage   = withdraw_reward_mvrk.storage.oracleRewardMvrk[oracle_address]
        
            # Update record
            user                            = await models.maven_user_cache.get(network=ctx.datasource.name.replace('mvkt_',''), address=oracle_address)
            aggregator                      = await models.Aggregator.get(network=ctx.datasource.name.replace('mvkt_',''), address= aggregator_address)
            oracle                          = await models.AggregatorOracle.get(
                aggregator  = aggregator,
                user        = user
            )
            oracle_reward_mvrk, _         = await models.AggregatorOracleReward.get_or_create(
                oracle      = oracle,
                type        = models.RewardType.MVRK
            )
            oracle_reward_mvrk.mvrk       = oracle_reward_mvrk_storage
            await oracle_reward_mvrk.save()

    except BaseException as e:
        await save_error_report(e)

