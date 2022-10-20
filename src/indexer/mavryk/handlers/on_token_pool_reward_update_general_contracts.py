
from mavryk.utils.persisters import persist_linked_contract
from mavryk.types.token_pool_reward.storage import TokenPoolRewardStorage
from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.token_pool_reward.parameter.update_general_contracts import UpdateGeneralContractsParameter
import mavryk.models as models

async def on_token_pool_reward_update_general_contracts(
    ctx: HandlerContext,
    update_general_contracts: Transaction[UpdateGeneralContractsParameter, TokenPoolRewardStorage],
) -> None:

    # Perists general contract
    await persist_linked_contract(models.TokenPoolReward, models.TokenPoolRewardGeneralContract, update_general_contracts)
