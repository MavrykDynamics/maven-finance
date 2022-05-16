
from dipdup.context import HandlerContext
from mavryk.types.governance.storage import GovernanceStorage
from dipdup.models import Transaction
from mavryk.types.governance.parameter.break_glass import BreakGlassParameter

async def on_governance_break_glass(
    ctx: HandlerContext,
    break_glass: Transaction[BreakGlassParameter, GovernanceStorage],
) -> None:
    ...