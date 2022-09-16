
from mavryk.types.token_pool_reward.storage import TokenPoolRewardStorage
from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.token_pool_reward.parameter.unpause_all import UnpauseAllParameter

async def on_token_pool_reward_unpause_all(
    ctx: HandlerContext,
    unpause_all: Transaction[UnpauseAllParameter, TokenPoolRewardStorage],
) -> None:

    breakpoint()
