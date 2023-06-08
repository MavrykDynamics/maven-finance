from mavryk.utils.error_reporting import save_error_report

from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.utils.persisters import persist_governance
from mavryk.types.break_glass.parameter.set_governance import SetGovernanceParameter
from mavryk.types.break_glass.storage import BreakGlassStorage
import mavryk.models as models

async def on_break_glass_set_governance(
    ctx: HandlerContext,
    set_governance: Transaction[SetGovernanceParameter, BreakGlassStorage],
) -> None:

    try:

        # Persist new governance
        await persist_governance(ctx, models.BreakGlass, set_governance)

    except BaseException as e:
         await save_error_report(e)

