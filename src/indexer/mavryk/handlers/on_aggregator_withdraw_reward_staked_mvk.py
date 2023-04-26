from mavryk.utils.error_reporting import save_error_report

from mavryk.types.aggregator.parameter.withdraw_reward_staked_mvk import WithdrawRewardStakedMvkParameter
from dipdup.models import Transaction
from mavryk.types.aggregator.storage import AggregatorStorage
from dipdup.context import HandlerContext
import mavryk.models as models

async def on_aggregator_withdraw_reward_staked_mvk(
    ctx: HandlerContext,
    withdraw_reward_staked_mvk: Transaction[WithdrawRewardStakedMvkParameter, AggregatorStorage],
) -> None:

    try:
        # Get operation info
        aggregator_address          = withdraw_reward_staked_mvk.data.target_address
        oracle_address              = withdraw_reward_staked_mvk.parameter.__root__
        oracle_reward_smvk_storage  = withdraw_reward_staked_mvk.storage.oracleRewardStakedMvk[oracle_address]
    
        # Update record
        user                            = await models.mavryk_user_cache.get(address=oracle_address)
        aggregator                      = await models.Aggregator.get(address   = aggregator_address)
        oracle                          = await models.AggregatorOracle.filter(
            aggregator  = aggregator,
            user        = user
        ).first()
        await oracle.save()
        oracle_reward_smvk, _       = await models.AggregatorOracleReward.get_or_create(
            oracle      = oracle,
            type        = models.RewardType.SMVK
        )
        oracle_reward_smvk.smvk     = oracle_reward_smvk_storage
        await oracle_reward_smvk.save()

    except BaseException:
         await save_error_report()

