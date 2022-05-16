
from mavryk.types.delegation.parameter.distribute_reward import DistributeRewardParameter
from dipdup.context import HandlerContext
from mavryk.types.delegation.storage import DelegationStorage
from dipdup.models import Transaction

async def on_delegation_distribute_reward(
    ctx: HandlerContext,
    distribute_reward: Transaction[DistributeRewardParameter, DelegationStorage],
) -> None:
    ...