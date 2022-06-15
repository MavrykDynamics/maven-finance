
from mavryk.types.aggregator.parameter.toggle_pause_withdraw_reward_xtz import TogglePauseWithdrawRewardXtzParameter
from mavryk.types.aggregator.storage import AggregatorStorage
from dipdup.models import Transaction
from dipdup.context import HandlerContext

async def on_aggregator_toggle_pause_withdraw_reward_xtz(
    ctx: HandlerContext,
    toggle_pause_withdraw_reward_xtz: Transaction[TogglePauseWithdrawRewardXtzParameter, AggregatorStorage],
) -> None:

    # Get operation info
    breakpoint()
