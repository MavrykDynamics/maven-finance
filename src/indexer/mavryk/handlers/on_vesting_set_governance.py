
from mavryk.types.vesting.parameter.set_governance import SetGovernanceParameter
from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.vesting.storage import VestingStorage

async def on_vesting_set_governance(
    ctx: HandlerContext,
    set_governance: Transaction[SetGovernanceParameter, VestingStorage],
) -> None:
    ...