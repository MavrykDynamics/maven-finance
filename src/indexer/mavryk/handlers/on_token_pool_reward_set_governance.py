
from mavryk.utils.persisters import persist_governance
from mavryk.types.token_pool_reward.storage import TokenPoolRewardStorage
from dipdup.context import HandlerContext
from mavryk.types.token_pool_reward.parameter.set_governance import SetGovernanceParameter
from dipdup.models import Transaction
import mavryk.models as models

async def on_token_pool_reward_set_governance(
    ctx: HandlerContext,
    set_governance: Transaction[SetGovernanceParameter, TokenPoolRewardStorage],
) -> None:
    
    # Get operation info
    target_contract = set_governance.data.target_address
    contract        = await models.TokenPoolReward.get(address = target_contract)

    # Persist new admin
    await persist_governance(set_governance, contract)
