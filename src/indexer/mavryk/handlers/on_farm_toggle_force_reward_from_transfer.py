
from dipdup.context import HandlerContext
from mavryk.types.farm.parameter.toggle_force_reward_from_transfer import ToggleForceRewardFromTransferParameter
from mavryk.types.farm.storage import FarmStorage
from dipdup.models import Transaction

async def on_farm_toggle_force_reward_from_transfer(
    ctx: HandlerContext,
    toggle_force_reward_from_transfer: Transaction[ToggleForceRewardFromTransferParameter, FarmStorage],
) -> None:
    ...