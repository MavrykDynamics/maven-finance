
from mavryk.types.aggregator.parameter.withdraw_reward_staked_mvk import WithdrawRewardStakedMvkParameter
from dipdup.models import Transaction
from mavryk.types.aggregator.storage import AggregatorStorage
from dipdup.context import HandlerContext
import mavryk.models as models

async def on_aggregator_withdraw_reward_staked_mvk(
    ctx: HandlerContext,
    withdraw_reward_staked_mvk: Transaction[WithdrawRewardStakedMvkParameter, AggregatorStorage],
) -> None:

    # Get operation info
    aggregator_address          = withdraw_reward_staked_mvk.data.target_address
    oracle_address              = withdraw_reward_staked_mvk.parameter.__root__
    oracle_reward_smvk_storage  = withdraw_reward_staked_mvk.storage.oracleRewardStakedMvk[oracle_address]

    # Update record
    oracle, _                   = await models.MavrykUser.get_or_create(address = oracle_address)
    await oracle.save()

    aggregator                  = await models.Aggregator.get(address   = aggregator_address)

    oracle_reward_smvk, _       = await models.AggregatorOracleRewardSMVK.get_or_create(
        aggregator  = aggregator,
        oracle      = oracle
    )
    oracle_reward_smvk.smvk     = oracle_reward_smvk_storage
    await oracle_reward_smvk.save()
