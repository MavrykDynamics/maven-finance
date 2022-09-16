
from mavryk.types.token_pool_reward.storage import TokenPoolRewardStorage
from dipdup.models import Origination
from dipdup.context import HandlerContext
import mavryk.models as models

async def on_token_pool_reward_origination(
    ctx: HandlerContext,
    token_pool_reward_origination: Origination[TokenPoolRewardStorage],
) -> None:
    
    # Get operation info
    token_pool_reward_address   = token_pool_reward_origination.data.originated_contract_address
    governance_address          = token_pool_reward_origination.storage.governanceAddress
    admin                       = token_pool_reward_origination.storage.admin
    update_reward_paused        = token_pool_reward_origination.storage.breakGlassConfig.updateRewardsIsPaused
    claim_reward_paused         = token_pool_reward_origination.storage.breakGlassConfig.claimRewardsIsPaused
    timestamp                   = token_pool_reward_origination.data.timestamp

    # Create record
    governance, _               = await models.Governance.get_or_create(
        address = governance_address
    ) 
    await governance.save()
    token_pool_reward           = models.TokenPoolReward(
        address                 = token_pool_reward_address,
        governance              = governance,
        admin                   = admin,
        last_updated_at         = timestamp,
        update_reward_paused    = update_reward_paused,
        claim_reward_paused     = claim_reward_paused
    )
    await token_pool_reward.save()
