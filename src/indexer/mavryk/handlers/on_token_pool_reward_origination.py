
from mavryk.types.token_pool_reward.storage import TokenPoolRewardStorage
from dipdup.models import Origination
from dipdup.context import HandlerContext

async def on_token_pool_reward_origination(
    ctx: HandlerContext,
    token_pool_reward_origination: Origination[TokenPoolRewardStorage],
) -> None:
    ...