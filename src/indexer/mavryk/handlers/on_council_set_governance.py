from mavryk.utils.error_reporting import save_error_report

from dipdup.context import HandlerContext
from mavryk.utils.persisters import persist_governance
from mavryk.types.council.storage import CouncilStorage
from dipdup.models import Transaction
from mavryk.types.council.parameter.set_governance import SetGovernanceParameter
import mavryk.models as models

async def on_council_set_governance(
    ctx: HandlerContext,
    set_governance: Transaction[SetGovernanceParameter, CouncilStorage],
) -> None:

    try:

        # Persist new governance
        await persist_governance(ctx, models.Council, set_governance)

    except BaseException as e:
         await save_error_report(e)

