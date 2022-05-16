
from mavryk.types.treasury.parameter.set_governance import SetGovernanceParameter
from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.treasury.storage import TreasuryStorage

async def on_treasury_set_governance(
    ctx: HandlerContext,
    set_governance: Transaction[SetGovernanceParameter, TreasuryStorage],
) -> None:
    ...