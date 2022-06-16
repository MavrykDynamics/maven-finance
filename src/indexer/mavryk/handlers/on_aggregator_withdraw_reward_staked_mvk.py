
from mavryk.types.aggregator.parameter.withdraw_reward_staked_mvk import WithdrawRewardStakedMvkParameter
from dipdup.models import Transaction
from mavryk.types.aggregator.storage import AggregatorStorage
from dipdup.context import HandlerContext

async def on_aggregator_withdraw_reward_staked_mvk(
    ctx: HandlerContext,
    withdraw_reward_staked_mvk: Transaction[WithdrawRewardStakedMvkParameter, AggregatorStorage],
) -> None:
    ...
