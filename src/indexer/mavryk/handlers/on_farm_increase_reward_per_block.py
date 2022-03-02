
from dipdup.context import HandlerContext
from mavryk.types.farm.parameter.increase_reward_per_block import IncreaseRewardPerBlockParameter
from mavryk.types.farm.storage import FarmStorage
from dipdup.models import Transaction

async def on_farm_increase_reward_per_block(
    ctx: HandlerContext,
    increase_reward_per_block: Transaction[IncreaseRewardPerBlockParameter, FarmStorage],
) -> None:
    ...