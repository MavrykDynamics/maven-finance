
from mavryk.types.governance.parameter.propagate_break_glass import PropagateBreakGlassParameter
from dipdup.context import HandlerContext
from mavryk.types.governance.storage import GovernanceStorage
from dipdup.models import Transaction

async def on_governance_propagate_break_glass(
    ctx: HandlerContext,
    propagate_break_glass: Transaction[PropagateBreakGlassParameter, GovernanceStorage],
) -> None:
    ...