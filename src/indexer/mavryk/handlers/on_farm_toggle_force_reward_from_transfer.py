
from dipdup.context import HandlerContext
from mavryk.types.farm.parameter.toggle_force_reward_from_transfer import ToggleForceRewardFromTransferParameter
from mavryk.types.farm.storage import FarmStorage
from dipdup.models import Transaction
import mavryk.models as models

async def on_farm_toggle_force_reward_from_transfer(
    ctx: HandlerContext,
    toggle_force_reward_from_transfer: Transaction[ToggleForceRewardFromTransferParameter, FarmStorage],
) -> None:
     # Get farm contract
    farmAddress = toggle_force_reward_from_transfer.data.target_address
    farmForce = toggle_force_reward_from_transfer.storage.forceRewardFromTransfer
    farm = await models.Farm.get(address=farmAddress)

    # Update farm
    farm.rewards_from_treasury = farmForce
    await farm.save()