
from mavryk.utils.persisters import persist_linked_contract
from mavryk.types.token_pool_reward.storage import TokenPoolRewardStorage
from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.token_pool_reward.parameter.update_whitelist_token_contracts import UpdateWhitelistTokenContractsParameter
import mavryk.models as models

async def on_token_pool_reward_update_whitelist_token_contracts(
    ctx: HandlerContext,
    update_whitelist_token_contracts: Transaction[UpdateWhitelistTokenContractsParameter, TokenPoolRewardStorage],
) -> None:
    
    # Persist whitelist token contract
    await persist_linked_contract(models.TokenPoolReward, models.TokenPoolRewardWhitelistTokenContract, update_whitelist_token_contracts, ctx)
