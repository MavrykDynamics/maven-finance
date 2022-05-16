
from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.break_glass.parameter.set_governance import SetGovernanceParameter
from mavryk.types.break_glass.storage import BreakGlassStorage

async def on_break_glass_set_governance(
    ctx: HandlerContext,
    set_governance: Transaction[SetGovernanceParameter, BreakGlassStorage],
) -> None:
    ...