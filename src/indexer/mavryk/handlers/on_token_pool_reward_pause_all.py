
from mavryk.types.token_pool_reward.storage import TokenPoolRewardStorage
from dipdup.context import HandlerContext
from mavryk.types.token_pool_reward.parameter.pause_all import PauseAllParameter
from dipdup.models import Transaction
import mavryk.models as models

async def on_token_pool_reward_pause_all(
    ctx: HandlerContext,
    pause_all: Transaction[PauseAllParameter, TokenPoolRewardStorage],
) -> None:

    # Get operation info
    token_pool_reward_address   = pause_all.data.target_address
    update_reward_paused        = pause_all.storage.breakGlassConfig.updateRewardsIsPaused
    claim_reward_paused         = pause_all.storage.breakGlassConfig.claimRewardsIsPaused

    # Update record
    token_pool_reward           = await models.TokenPoolReward.get(
        address = token_pool_reward_address
    )
    token_pool_reward.update_reward_paused  = update_reward_paused
    token_pool_reward.claim_reward_paused   = claim_reward_paused
    await token_pool_reward.save()
