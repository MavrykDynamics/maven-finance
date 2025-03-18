from maven.utils.error_reporting import save_error_report

from maven.types.aggregator.tezos_parameters.withdraw_reward_staked_mvn import WithdrawRewardStakedMvnParameter
from dipdup.models.tezos import TezosTransaction
from maven.types.aggregator.tezos_storage import AggregatorStorage
from dipdup.context import HandlerContext
from maven import models as models

async def withdraw_reward_staked_mvn(
    ctx: HandlerContext,
    withdraw_reward_staked_mvn: TezosTransaction[WithdrawRewardStakedMvnParameter, AggregatorStorage],
) -> None:

    try:
        # Get operation info
        aggregator_address          = withdraw_reward_staked_mvn.data.target_address
        oracle_address              = withdraw_reward_staked_mvn.parameter.root
        if oracle_address in withdraw_reward_staked_mvn.storage.oracleRewardStakedMvn:
            oracle_reward_smvn_storage  = withdraw_reward_staked_mvn.storage.oracleRewardStakedMvn[oracle_address]
        
            # Update record
            user                            = await models.maven_user_cache.get(network='atlasnet', address=oracle_address)
            aggregator                      = await models.Aggregator.get(network='atlasnet', address= aggregator_address)
            oracle                          = await models.AggregatorOracle.get(
                aggregator  = aggregator,
                user        = user
            )
            oracle_reward_smvn, _       = await models.AggregatorOracleReward.get_or_create(
                oracle      = oracle,
                type        = models.RewardType.SMVN
            )
            oracle_reward_smvn.smvn     = oracle_reward_smvn_storage
            await oracle_reward_smvn.save()

    except BaseException as e:
        await save_error_report(e)

