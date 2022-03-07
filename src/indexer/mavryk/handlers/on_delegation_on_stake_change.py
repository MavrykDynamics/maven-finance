
from dipdup.models import Transaction
from mavryk.types.delegation.parameter.on_stake_change import OnStakeChangeParameter
from dipdup.context import HandlerContext
from mavryk.types.delegation.storage import DelegationStorage

async def on_delegation_on_stake_change(
    ctx: HandlerContext,
    on_stake_change: Transaction[OnStakeChangeParameter, DelegationStorage],
) -> None:
    ...