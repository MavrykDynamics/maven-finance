
from dipdup.context import HandlerContext
from mavryk.types.farm.parameter.increase_reward_per_block import IncreaseRewardPerBlockParameter
from mavryk.types.farm.storage import FarmStorage
from dipdup.models import Transaction
import mavryk.models as models

async def on_farm_increase_reward_per_block(
    ctx: HandlerContext,
    increase_reward_per_block: Transaction[IncreaseRewardPerBlockParameter, FarmStorage],
) -> None:
    # Get operation data
    farmAddress = increase_reward_per_block.data.target_address
    farmAccumulated = float(increase_reward_per_block.storage.accumulatedMVKPerShare)
    farmLastBlock = int(increase_reward_per_block.storage.lastBlockUpdate)
    farmNewReward = int(increase_reward_per_block.parameter.__root__)

    # Update values
    farm = await models.Farm.get(
        address = farmAddress
    )
    farm.accumulated_mvk_per_share = farmAccumulated
    farm.last_block_update = farmLastBlock
    farm.reward_per_block = farmNewReward
    await farm.save()
