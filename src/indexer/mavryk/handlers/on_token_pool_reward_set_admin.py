from mavryk.utils.persisters import persist_admin
from mavryk.types.token_pool_reward.storage import TokenPoolRewardStorage
from mavryk.types.token_pool_reward.parameter.set_admin import SetAdminParameter
from dipdup.context import HandlerContext
from dipdup.models import Transaction
import mavryk.models as models

async def on_token_pool_reward_set_admin(
    ctx: HandlerContext,
    set_admin: Transaction[SetAdminParameter, TokenPoolRewardStorage],
) -> None:
    
    # Get operation info
    target_contract = set_admin.data.target_address
    contract        = await models.TokenPoolReward.get(address = target_contract)

    # Persist new admin
    await persist_admin(set_admin, contract)
