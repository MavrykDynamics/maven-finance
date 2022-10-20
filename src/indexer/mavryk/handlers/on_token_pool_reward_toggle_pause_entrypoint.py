
from mavryk.types.token_pool_reward.storage import TokenPoolRewardStorage
from mavryk.types.token_pool_reward.parameter.toggle_pause_entrypoint import TogglePauseEntrypointParameter
from dipdup.context import HandlerContext
from dipdup.models import Transaction
import mavryk.models as models

async def on_token_pool_reward_toggle_pause_entrypoint(
    ctx: HandlerContext,
    toggle_pause_entrypoint: Transaction[TogglePauseEntrypointParameter, TokenPoolRewardStorage],
) -> None:

    # Get operation info
    token_pool_reward_address   = toggle_pause_entrypoint.data.target_address
    update_reward_paused        = toggle_pause_entrypoint.storage.breakGlassConfig.updateRewardsIsPaused
    claim_reward_paused         = toggle_pause_entrypoint.storage.breakGlassConfig.claimRewardsIsPaused

    # Update record
    token_pool_reward           = await models.TokenPoolReward.get(
        address = token_pool_reward_address
    )
    token_pool_reward.update_reward_paused  = update_reward_paused
    token_pool_reward.claim_reward_paused   = claim_reward_paused
    await token_pool_reward.save()
