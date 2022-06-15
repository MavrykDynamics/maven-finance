
from mavryk.types.aggregator.parameter.withdraw_reward_xtz import WithdrawRewardXtzParameter
from mavryk.types.aggregator.storage import AggregatorStorage
from dipdup.models import Transaction
from dipdup.context import HandlerContext

async def on_aggregator_withdraw_reward_xtz(
    ctx: HandlerContext,
    withdraw_reward_xtz: Transaction[WithdrawRewardXtzParameter, AggregatorStorage],
) -> None:

    # Get operation info
    breakpoint()
