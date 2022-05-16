
from dipdup.context import HandlerContext
from mavryk.types.delegation.storage import DelegationStorage
from dipdup.models import Transaction
from mavryk.types.delegation.parameter.set_governance import SetGovernanceParameter

async def on_delegation_set_governance(
    ctx: HandlerContext,
    set_governance: Transaction[SetGovernanceParameter, DelegationStorage],
) -> None:
    ...