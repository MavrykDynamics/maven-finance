from mavryk.utils.error_reporting import save_error_report

from mavryk.utils.persisters import persist_governance
from mavryk.types.farm.parameter.set_governance import SetGovernanceParameter
from dipdup.context import HandlerContext
from mavryk.types.farm.storage import FarmStorage
from dipdup.models import Transaction
import mavryk.models as models

async def on_farm_set_governance(
    ctx: HandlerContext,
    set_governance: Transaction[SetGovernanceParameter, FarmStorage],
) -> None:

    try:

        # Persist new governance
        await persist_governance(ctx, models.Farm, set_governance)

    except BaseException as e:
         await save_error_report(e)

