
from mavryk.types.token_pool_reward.storage import TokenPoolRewardStorage
from mavryk.types.token_pool_reward.parameter.toggle_pause_entrypoint import TogglePauseEntrypointParameter
from dipdup.context import HandlerContext
from dipdup.models import Transaction

async def on_token_pool_reward_toggle_pause_entrypoint(
    ctx: HandlerContext,
    toggle_pause_entrypoint: Transaction[TogglePauseEntrypointParameter, TokenPoolRewardStorage],
) -> None:

    breakpoint()
