
from mavryk.types.aggregator.storage import AggregatorStorage
from dipdup.models import Transaction
from mavryk.types.aggregator.parameter.toggle_pause_withdraw_reward_s_mvk import TogglePauseWithdrawRewardSMvkParameter
from dipdup.context import HandlerContext

async def on_aggregator_toggle_pause_withdraw_reward_smvk(
    ctx: HandlerContext,
    toggle_pause_withdraw_reward_s_mvk: Transaction[TogglePauseWithdrawRewardSMvkParameter, AggregatorStorage],
) -> None:
    ...
