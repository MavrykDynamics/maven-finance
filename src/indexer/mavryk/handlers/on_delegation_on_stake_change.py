
from mavryk.types.delegation.storage import DelegationStorage
from dipdup.context import HandlerContext
from mavryk.types.delegation.parameter.on_stake_change import OnStakeChangeParameter
from dipdup.models import Transaction

async def on_delegation_on_stake_change(
    ctx: HandlerContext,
    on_stake_change: Transaction[OnStakeChangeParameter, DelegationStorage],
) -> None:
    ...