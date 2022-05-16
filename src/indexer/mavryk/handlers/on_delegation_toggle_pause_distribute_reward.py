
from mavryk.types.delegation.parameter.toggle_pause_distribute_reward import TogglePauseDistributeRewardParameter
from dipdup.context import HandlerContext
from mavryk.types.delegation.storage import DelegationStorage
from dipdup.models import Transaction

async def on_delegation_toggle_pause_distribute_reward(
    ctx: HandlerContext,
    toggle_pause_distribute_reward: Transaction[TogglePauseDistributeRewardParameter, DelegationStorage],
) -> None:
    ...