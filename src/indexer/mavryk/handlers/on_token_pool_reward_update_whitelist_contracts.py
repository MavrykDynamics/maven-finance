
from mavryk.utils.persisters import persist_linked_contract
from mavryk.types.token_pool_reward.parameter.update_whitelist_contracts import UpdateWhitelistContractsParameter
from mavryk.types.token_pool_reward.storage import TokenPoolRewardStorage
from dipdup.context import HandlerContext
from dipdup.models import Transaction
import mavryk.models as models

async def on_token_pool_reward_update_whitelist_contracts(
    ctx: HandlerContext,
    update_whitelist_contracts: Transaction[UpdateWhitelistContractsParameter, TokenPoolRewardStorage],
) -> None:

    # Persist whitelist contract
    await persist_linked_contract(models.TokenPoolReward, models.TokenPoolRewardWhitelistContract, update_whitelist_contracts)
