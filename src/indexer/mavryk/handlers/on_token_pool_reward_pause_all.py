
from mavryk.types.token_pool_reward.storage import TokenPoolRewardStorage
from dipdup.context import HandlerContext
from mavryk.types.token_pool_reward.parameter.pause_all import PauseAllParameter
from dipdup.models import Transaction

async def on_token_pool_reward_pause_all(
    ctx: HandlerContext,
    pause_all: Transaction[PauseAllParameter, TokenPoolRewardStorage],
) -> None:
    
    breakpoint()
