
from mavryk.types.token_pool_reward.storage import TokenPoolRewardStorage
from mavryk.types.token_pool_reward.parameter.update_rewards import UpdateRewardsParameter
from dipdup.context import HandlerContext
from dipdup.models import Transaction

async def on_token_pool_reward_update_rewards(
    ctx: HandlerContext,
    update_rewards: Transaction[UpdateRewardsParameter, TokenPoolRewardStorage],
) -> None:
    ...