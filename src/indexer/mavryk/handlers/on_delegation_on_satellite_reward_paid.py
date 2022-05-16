
from dipdup.context import HandlerContext
from mavryk.types.delegation.storage import DelegationStorage
from dipdup.models import Transaction
from mavryk.types.delegation.parameter.on_satellite_reward_paid import OnSatelliteRewardPaidParameter

async def on_delegation_on_satellite_reward_paid(
    ctx: HandlerContext,
    on_satellite_reward_paid: Transaction[OnSatelliteRewardPaidParameter, DelegationStorage],
) -> None:
    ...