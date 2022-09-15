
from mavryk.types.token_pool_reward.storage import TokenPoolRewardStorage
from mavryk.types.token_pool_reward.parameter.claim_rewards import ClaimRewardsParameter
from dipdup.context import HandlerContext
from dipdup.models import Transaction

async def on_token_pool_reward_claim_rewards(
    ctx: HandlerContext,
    claim_rewards: Transaction[ClaimRewardsParameter, TokenPoolRewardStorage],
) -> None:
    ...